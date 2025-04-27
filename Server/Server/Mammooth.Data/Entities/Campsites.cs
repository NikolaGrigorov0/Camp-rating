using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mammooth.Data.Entities
{
    public class Campsites
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Name { get; set; }
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
    }
}