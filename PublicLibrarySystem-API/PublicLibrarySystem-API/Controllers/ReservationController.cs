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
                DueDate = request.DueDate,
                IsExpired = false // Initial state is not expired
            };

            _dbContext.Reservations.Add(reservation);
            await _dbContext.SaveChangesAsync();

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
