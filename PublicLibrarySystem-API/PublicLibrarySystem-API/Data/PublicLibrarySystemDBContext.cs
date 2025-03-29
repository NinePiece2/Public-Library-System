using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PublicLibrarySystem_API.Models;
using PublicLibrarySystem_API.Data.Tables;

namespace PublicLibrarySystem_API.Data
{
    public class PublicLibrarySystemDBContext : DbContext
    {
        public PublicLibrarySystemDBContext(DbContextOptions<PublicLibrarySystemDBContext> options)
       : base(options)
        {
        }

        public DbSet<PowerSettings> PowerSettings { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<PowerSettings>().ToTable("PowerSettings", t => t.ExcludeFromMigrations());

            builder.Entity<PowerSettings>(entity =>
            {
                entity.HasKey(e => e.Key);
            });

            builder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

             builder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DueDate).IsRequired();
                entity.Property(e => e.IsExpired).HasDefaultValue(false);
            });

        }


    }
}
