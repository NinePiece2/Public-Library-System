using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<PowerSettings>(entity =>
            {
                entity.HasKey(e => e.Key);
            });

            builder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
            });
        }


    }
}
