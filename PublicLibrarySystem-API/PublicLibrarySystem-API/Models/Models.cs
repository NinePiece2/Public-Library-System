namespace PublicLibrarySystem_API.Models
{
    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string EmailOrUsername { get; set; }
        public string Password { get; set; }
    }

    public class CreateReservationRequest
    {
        public DateTime DueDate { get; set; }
    }

    public class UpdateReservationRequest
    {
        public DateTime? DueDate { get; set; }
        public bool? IsExpired { get; set; }
    }

}
