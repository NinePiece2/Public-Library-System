using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PublicLibrarySystem.Areas.Identity.Data;
using PublicLibrarySystem.Models;

namespace PublicLibrarySystem.Data;

public class PublicLibrarySystemContext : IdentityDbContext<PublicLibrarySystemUser>
{
    public PublicLibrarySystemContext(DbContextOptions<PublicLibrarySystemContext> options)
        : base(options)
    {
    }
    public DbSet<PowerSettings> PowerSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Rename the ASP.NET Identity tables by removing the "AspNet" prefix
        builder.Entity<PublicLibrarySystemUser>(entity => entity.ToTable("Users"));
        builder.Entity<IdentityRole>(entity => entity.ToTable("Roles"));
        builder.Entity<IdentityUserRole<string>>(entity => entity.ToTable("UserRoles"));
        builder.Entity<IdentityUserClaim<string>>(entity => entity.ToTable("UserClaims"));
        builder.Entity<IdentityUserLogin<string>>(entity => entity.ToTable("UserLogins"));
        builder.Entity<IdentityRoleClaim<string>>(entity => entity.ToTable("RoleClaims"));
        builder.Entity<IdentityUserToken<string>>(entity => entity.ToTable("UserTokens"));

        builder.Entity<PowerSettings>(entity =>
        {
            entity.HasKey(e => e.Key);
        });
    }
}
