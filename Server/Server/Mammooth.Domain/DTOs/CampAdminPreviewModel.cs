using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mammooth.Data.Entities;

namespace Mammooth.Domain.DTOs
{
    public class CampAdminPreviewModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public CampAdminPreviewModel(Campsites campsite)
        {
            Id = campsite.Id;
            Name = campsite.Name;
            Description = campsite.Description;
            ImageUrl = campsite.ImageUrl;
            Latitude = campsite.Latitude;
            Longitude = campsite.Longitude;
        }
    }
}