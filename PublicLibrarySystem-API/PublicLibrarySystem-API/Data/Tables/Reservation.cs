namespace PublicLibrarySystem_API.Data.Tables
{
    public class Reservation
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int BookId { get; set; }
        public DateTime ReservationDate { get; set; }
        public DateTime ExpirationDate {get; set; }
        public bool IsExpired { get; set; }
        public DateTime? DueDate {get; set; }
        public bool IsClaimed { get; set; } = false;
        public bool IsReturned { get; set; } = false;

        public void MarkExpired()
        {
            IsExpired = true;
        }

    }
}
