using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Mammooth.Common.Requests.Camps
{
    public class CreateCampRequest
    {
        [Required(ErrorMessage = "Name is required.")]
        [MinLength(5, ErrorMessage = "Name must be at least 5 characters.")]
        [MaxLength(64, ErrorMessage = "Name cannot be longer than 64 characters.")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [MinLength(5, ErrorMessage = "Description must be at least 5 characters.")]
        [MaxLength(255, ErrorMessage = "Description cannot be longer than 255 characters.")]
        public required string Description { get; set; }
        [Required(ErrorMessage = "Latitude is required.")]
        public double Latitude { get; set; }
        [Required(ErrorMessage = "Longitude is required.")]
        public double Longitude { get; set; }
        [Required(ErrorMessage = "Image URL is required.")]
        public required string ImageUrl { get; set; }        
    }
}