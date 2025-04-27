using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mammooth.Domain.DTOs
{
    public class CampUpdateModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}