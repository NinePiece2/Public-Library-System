namespace PublicLibrarySystem_API.Data.Tables
{
    public class Reservation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public DateTime ReservationDate { get; set; }
        public DateTime ExpirationDate {get; set; }
        public bool IsExpired => DateTime.Now > ExpirationDate;
        public DateTime DueDate {get; set; }

    }
}
