using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PublicLibrarySystem_API.Models;
using PublicLibrarySystem_API.Data.Tables;
using static System.Reflection.Metadata.BlobBuilder;

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
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

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

            builder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.Id);

            });

            builder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.ID);
            });

            builder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => e.ID);
            });

        }


    }
}
