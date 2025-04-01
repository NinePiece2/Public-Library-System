using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PublicLibrarySystem_API.Data.Tables
{
    public class UserRole
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public Guid UserID { get; set; }

        [Required]
        public Guid RoleID { get; set; }

        [ForeignKey("RoleID")]
        public Role Role { get; set; }

        [ForeignKey("UserID")]
        public User User { get; set; }
    }
}