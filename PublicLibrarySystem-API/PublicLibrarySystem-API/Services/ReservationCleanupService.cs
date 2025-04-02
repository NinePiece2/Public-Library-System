using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using PublicLibrarySystem_API.Data;
using Microsoft.EntityFrameworkCore;
using PublicLibrarySystem_API.Data.Tables;

public class ReservationCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public ReservationCleanupService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<PublicLibrarySystemDBContext>();

                // Get all expired reservations (those with a ExpirationDate before now and not already expired)
                var expiredReservations = await dbContext.Reservations
                    .Where(r => !r.IsClaimed && !r.IsExpired && !r.IsReturned && r.ExpirationDate < DateTime.UtcNow)
                    .ToListAsync();

                // Mark each reservation as expired
                foreach (var reservation in expiredReservations)
                {
                    reservation.MarkExpired(); 
                    Book book = await dbContext.Books.FindAsync(reservation.BookId);
                    if (book != null)
                    {
                        book.IsAvailable = true; // Mark the book as available
                    }
                }

                // Save changes after marking them as expired
                await dbContext.SaveChangesAsync();

                // Remove expired reservations from the database
                dbContext.Reservations.RemoveRange(expiredReservations);
                await dbContext.SaveChangesAsync();
            }

            // Delay the next cleanup check by 10 minutes
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}
