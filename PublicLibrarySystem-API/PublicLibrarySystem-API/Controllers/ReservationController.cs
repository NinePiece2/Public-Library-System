using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PublicLibrarySystem_API.Data;
using PublicLibrarySystem_API.Data.Tables;
using PublicLibrarySystem_API.Models;
using System.Linq;
using System.Threading.Tasks;

namespace PublicLibrarySystem_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReservationController : ControllerBase
    {
        private readonly PublicLibrarySystemDBContext _dbContext;

        public ReservationController(PublicLibrarySystemDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/Reservation
        [HttpGet]
        public IActionResult GetReservations()
        {
            var reservations = _dbContext.Reservations.ToList();
            return Ok(reservations);
        }

        [HttpGet("GetPendingReservations")]
        public IActionResult GetPendingReservations()
        {
            var reservations = _dbContext.Reservations
                .Where(s => s.IsClaimed == false && s.IsExpired == false && s.IsReturned == false)
                .ToList();

            var userIds = reservations.Select(r => r.UserId).Distinct().ToList();
            var bookIds = reservations.Select(r => r.BookId).Distinct().ToList();

            var users = _dbContext.Users
                .Where(u => userIds.Contains(u.Id))
                .ToList();
            var books = _dbContext.Books
                .Where(b => bookIds.Contains(b.Id))
                .ToList();

            var reservationsWithDetails = reservations.Select(r => new
            {
                Reservation = r,
                User = users
                    .Where(u => u.Id == r.UserId)
                    .Select(u => new { u.Id, u.Email, u.Username })
                    .FirstOrDefault(),
                Book = books.FirstOrDefault(b => b.Id == r.BookId)
            }).ToList();

            return Ok(reservationsWithDetails);
        }

        [HttpPut("ClaimReservation/{id}")]
        public async Task<IActionResult> ClaimReservation(int id)
        {
            var reservation = _dbContext.Reservations.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
                return NotFound();

            reservation.IsClaimed = true;
            reservation.DueDate = DateTime.UtcNow.AddDays(7);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("GetPendingReturns")]
        public IActionResult GetPendingReturns()
        {
            var reservations = _dbContext.Reservations
                .Where(s => s.IsClaimed == true)
                .ToList();

            var userIds = reservations.Select(r => r.UserId).Distinct().ToList();
            var bookIds = reservations.Select(r => r.BookId).Distinct().ToList();

            var users = _dbContext.Users
                .Where(u => userIds.Contains(u.Id))
                .ToList();
            var books = _dbContext.Books
                .Where(b => bookIds.Contains(b.Id))
                .ToList();

            var reservationsWithDetails = reservations.Select(r => new
            {
                Reservation = r,
                User = users
                    .Where(u => u.Id == r.UserId)
                    .Select(u => new { u.Id, u.Email, u.Username })
                    .FirstOrDefault(),
                Book = books.FirstOrDefault(b => b.Id == r.BookId)
            }).ToList();

            return Ok(reservationsWithDetails);
        }

        [HttpPut("ReturnReservation/{id}")]
        public async Task<IActionResult> ReturnReservation(int id)
        {
            var reservation = _dbContext.Reservations.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
                return NotFound();

            reservation.IsClaimed = false;
            reservation.IsReturned = true;
            reservation.ReturnedDate = DateTime.UtcNow;

            var book = _dbContext.Books.FirstOrDefault(b => b.Id == reservation.BookId);
            if (book != null)
            {
                book.IsAvailable = true;
                _dbContext.Books.Update(book);
            }

            await _dbContext.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("GetUserReservations")]
        public IActionResult GetUserReservations([FromQuery]Guid userId)
        {
            var reservations = _dbContext.Reservations
                .Where(r => r.UserId == userId)
                .ToList();

            var user = _dbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return NotFound();

            var books = _dbContext.Books
                .Where(b => reservations.Select(r => r.BookId).Contains(b.Id))
                .ToList();

            var reservationsWithDetails = reservations.Select(r => new
            {
                Reservation = r,
                User = new { user.Id, user.Email, user.Username },
                Book = books.FirstOrDefault(b => b.Id == r.BookId)
            }).ToList();

            return Ok(reservationsWithDetails);
        }

        [HttpPut("ExtendReservation/{reservationId}")]
        public async Task<IActionResult> ExtendReservation(int reservationId)
        {
            var reservation = await _dbContext.Reservations.FindAsync(reservationId);
            if (reservation == null)
            {
                return NotFound("Reservation not found.");
            }

            if (!reservation.DueDate.HasValue)
            {
                return BadRequest("Reservation due date is not set.");
            }

            // Validation 1: Cannot extend an expired reservation.
            if (reservation.DueDate.Value < DateTime.UtcNow)
            {
                return BadRequest("Cannot extend an expired reservation.");
            }
            
            // Validation 2: Can't extend a reservation if its due date is not close (within 2 days).
            // Here we check if the due date is more than 2 days from now.
            if (reservation.DueDate.Value > DateTime.UtcNow.AddDays(2))
            {
                return BadRequest("Cannot extend a reservation that is not close to expiration.");
            }
            
            // If validations pass, extend the due date by 7 days.
            reservation.DueDate = reservation.DueDate.Value.AddDays(7);
            await _dbContext.SaveChangesAsync();

            return Ok("Reservation extended successfully.");
        }



        // GET: api/Reservation/{id}
        [HttpGet("{id}")]
        public IActionResult GetReservation(int id)
        {
            var reservation = _dbContext.Reservations.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
                return NotFound();

            return Ok(reservation);
        }

        // POST: api/Reservation
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            if (request == null)
                return BadRequest("Invalid reservation data");

            var reservation = new Reservation
            {
                BookId = request.BookId,
                UserId = request.UserId,
                DueDate = null,
                IsExpired = false,
                ReservationDate = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(1),
                IsReturned = false,
                IsClaimed = false
            };

            _dbContext.Reservations.Add(reservation);
            await _dbContext.SaveChangesAsync();

            var book = _dbContext.Books.FirstOrDefault(b => b.Id == request.BookId);
            if (book != null)
            {
                book.IsAvailable = false;
                _dbContext.Books.Update(book);
                await _dbContext.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, reservation);
        }

        // PUT: api/Reservation/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] UpdateReservationRequest request)
        {
            var reservation = _dbContext.Reservations.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
                return NotFound();

            reservation.DueDate = request.DueDate ?? reservation.DueDate;
            reservation.IsExpired = request.IsExpired ?? reservation.IsExpired;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Reservation/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = _dbContext.Reservations.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
                return NotFound();

            _dbContext.Reservations.Remove(reservation);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        // Optionally, a method to mark a reservation as expired
        [HttpPost("{id}/expire")]
        public async Task<IActionResult> MarkReservationAsExpired(int id)
        {
            var reservation = _dbContext.Reservations.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
                return NotFound();

            reservation.MarkExpired(); // Using the method in the Reservation class
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
