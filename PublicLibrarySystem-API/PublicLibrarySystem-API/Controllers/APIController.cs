using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PublicLibrarySystem_API.Data;

namespace PublicLibrarySystem_API.Controllers
{
    [Route("api/")]
    [ApiController]
    [Authorize]
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
    }
}
