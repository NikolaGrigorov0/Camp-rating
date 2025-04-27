using System;
using System.ComponentModel.DataAnnotations;

namespace Mammooth.Data.Entities
{
    public class Review
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        [Required]
        public string CampId { get; set; }
        public Campsites Camp { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(500)]
        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}