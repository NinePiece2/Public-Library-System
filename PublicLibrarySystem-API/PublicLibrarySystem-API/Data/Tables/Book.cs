namespace PublicLibrarySystem_API.Data.Tables
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string? ISBN { get; set; }
        public string Genre { get; set; }
        public string Publisher { get; set; }
        public int? Pages { get; set; }
        public string Language { get; set; }
        public string Description { get; set; }
        public bool IsAvailable { get; set; } = true;
        public DateTime? PublishedDate {get; set; }
        public string? ImageBase64 { get; set; }
        public string? ImageMimeType { get; set; }
    }
}
 