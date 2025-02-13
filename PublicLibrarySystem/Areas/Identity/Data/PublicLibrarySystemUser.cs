using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace PublicLibrarySystem.Areas.Identity.Data;

// Add profile data for application users by adding properties to the PublicLibrarySystemUser class
public class PublicLibrarySystemUser : IdentityUser
{
    [MaxLength(255)]
    public string? Name { get; set; }
}

