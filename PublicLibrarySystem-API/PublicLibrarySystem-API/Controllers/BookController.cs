using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PublicLibrarySystem_API.Data.Tables;
using PublicLibrarySystem_API.Data;
using PublicLibrarySystem_API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace PublicLibrarySystem_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly PublicLibrarySystemDBContext _context;

        public BooksController(PublicLibrarySystemDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            try
            {
                var books = await _context.Books.ToListAsync();
                if (books == null || books.Count == 0)
                {
                    return NotFound("No books found.");
                }
                return Ok(books);
            }
            catch (Exception ex)
            {
                // Log the error (you can use a logger here)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetRecommendedBooks")]
        public async Task<ActionResult<IEnumerable<Book>>> GetRecommendedBooks(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return BadRequest("User ID is required.");
            }
            
            try
            {
                // Get all books.
                var books = await _context.Books.ToListAsync();
                if (books == null || books.Count == 0)
                {
                    return NotFound("No books found.");
                }
                
                // Retrieve reservations for the given user.
                var reservations = await _context.Reservations
                                                .Where(r => r.UserId == userId)
                                                .ToListAsync();
                
                // Extract reserved genres from the user's past reservations.
                // For each reservation, we look up the book and then get its Genre.
                var reservedGenres = reservations
                    .Select(r => books.FirstOrDefault(b => b.Id == r.BookId)?.Genre)
                    .Where(g => !string.IsNullOrEmpty(g))
                    .Select(g => g.ToLowerInvariant())
                    .Distinct()
                    .ToList();
                
                // Reorder the books:
                // Books with a Genre that contains any of the reserved genres (case-insensitive) come first.
                var recommendedBooks = books
                    .OrderByDescending(b => reservedGenres.Any(rg => b.Genre != null && b.Genre.ToLowerInvariant().Contains(rg)))
                    .ThenBy(b => b.Title)  // For consistency, sort the rest alphabetically.
                    .ToList();
                
                return Ok(recommendedBooks);
            }
            catch (Exception ex)
            {
                // Log the error as needed.
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetBook/{*id}")]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            try
            {
                Console.WriteLine($"Fetching book with ID: {id}");
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                {
                    return NotFound($"Book with ID {id} not found.");
                }
                return Ok(book);
            }
            catch (Exception ex)
            {
                // Log the error (you can use a logger here)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Book>> AddBook([FromBody]Book book)
        {
            if (book == null)
            {
                return BadRequest("Book is null.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Books.Add(book);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetBooks), new { id = book.Id }, book);
            }
            catch (DbUpdateException dbEx)
            {
                // Log the exception (you can use a logger here)
                return StatusCode(500, $"Database error: {dbEx.Message}");
            }
            catch (Exception ex)
            {
                // Log the exception (you can use a logger here)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
