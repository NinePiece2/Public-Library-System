using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PublicLibrarySystem_API.Data.Tables
{
    public class Role
    {
        [Key]
        public Guid ID { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<UserRole> UserRoles { get; set; }
    }
}