using Microsoft.Extensions.Logging;

public class BookService
{
    private readonly ILogger<BookService> _logger;

    public BookService(ILogger<BookService> logger)
    {
        _logger = logger;
    }

    public void LogMessage(string message)
    {
        _logger.LogInformation($"[LOG] {message}");
    }
}
