namespace PublicLibrarySystem_API.Data.Tables
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ISBN { get; set; }
        public bool IsAvailable { get; set; } = true;
        public DateTime PublishedDate {get; set; }
    }
}
