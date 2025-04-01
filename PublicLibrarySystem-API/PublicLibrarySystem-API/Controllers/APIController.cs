using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PublicLibrarySystem_API.Data;

namespace PublicLibrarySystem_API.Controllers
{
    [Route("api/")]
    [ApiController]
    public class APIController : ControllerBase
    {
        private readonly PublicLibrarySystemDBContext context;

        public APIController(PublicLibrarySystemDBContext context)
        {
            this.context = context;
        }

        [Route("Test")]
        [HttpGet]
        public IActionResult Test()
        {
            return Ok("API is working");
        }

        [Route("GetBookImage")]
        [HttpGet]
        public async Task<IActionResult> GetBookImage([FromQuery] string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                return BadRequest("Image URL cannot be null or empty.");
            }

            try
            {
                using(HttpClient client = new HttpClient())
                {
                    byte[] imageBytes = await client.GetByteArrayAsync(imageUrl);
                    string base64Image = Convert.ToBase64String(imageBytes);
                    return Ok(base64Image);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
