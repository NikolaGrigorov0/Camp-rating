using Mammooth.Common.DTOs;
using Mammooth.Common.Requests.User;
using Mammooth.Common.Requests.Camps;
using Mammooth.Data.Context;
using Mammooth.Data.Entities;
using Mammooth.Domain.DTOs;
using Mammooth.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mammooth.Domain.Services
{
    public class AdminService(AppDbContext dbContext) : IAdminService
    {
        private readonly AppDbContext _dbContext = dbContext;

        public async Task<(bool Success, string Message)> AddCamp(CreateCampRequest request)
        {
            if (string.IsNullOrEmpty(request.Name))
            {
                return (false, "Name is required.");
            }

            // if (request.Year <= 0 || request.Seats <= 0 || request.PricePerDay <= 0)
            // {
            //     return (false, "Invalid car details provided.");
            // }

            // Car newCar = new Car
            // {
            //     Brand = request.Brand,
            //     Model = request.Model,
            //     Year = request.Year,
            //     Seats = request.Seats,
            //     Description = request.Description ?? string.Empty,
            //     PricePerDay = request.PricePerDay,
            //     ImageUrl = request.ImageUrl,
            //     RentalRequests = new List<RentalRequest>()
            // };

            // _dbContext.Cars.Add(newCar);

            Campsites newCamp = new Campsites
            {
                Name = request.Name,
                Description = request.Description,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                ImageUrl = request.ImageUrl,
            };

            _dbContext.Campsites.Add(newCamp);

            await _dbContext.SaveChangesAsync();

            return (true, "Campsite added successfully.");
        }
        public async Task<(bool Success, string Message)> DeleteCamp(string id)
        {
            var camp = await _dbContext.Campsites.FindAsync(id);

            if (camp == null) return (false, "No camp found.");

            _dbContext.Campsites.Remove(camp);
            await _dbContext.SaveChangesAsync();
            return (true, "Camp deleted successfully.");
        }
        public async Task<(bool Success, string Message)> UpdateCamp(string id, CampUpdateModel updatedCamp)
        {
            var camp = await _dbContext.Campsites.FindAsync(id);
            if (camp == null) return (false, "No camp found.");

            camp.Name = updatedCamp.Name;
            camp.Description = updatedCamp.Description;
            camp.Latitude = updatedCamp.Latitude;
            camp.Longitude = updatedCamp.Longitude;
            camp.ImageUrl = updatedCamp.ImageUrl;
            await _dbContext.SaveChangesAsync();
            return (true, "Camp updated successfully.");
        }
        public async Task<(bool Success, string Message, List<CampAdminPreviewModel> dataRetrieved)> GetAllCampEnquieries()
        {
            var enqueries = await _dbContext.Campsites
                                    .Select(c => new CampAdminPreviewModel(c))
                                    .ToListAsync();

            if (enqueries == null || enqueries.Count == 0)
            {
                return (false, "No camp inquiries found.", null);
            }

            return (true, "Camp inquiries retrieved successfully.", enqueries);
        }
        public async Task<(bool Success, string Message)> AddUser(CreateUserRequest request)
        {
            if (string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName))
            {
                return (false, "First name and last name are required.");
            }

            User newUser = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                UserName = request.UserName,
                NormalizedUserName = request.UserName.ToUpper(),
            };

            _dbContext.Users.Add(newUser);

            await _dbContext.SaveChangesAsync();

            return (true, "User added successfully.");
        }
        public async Task<(bool Success, string Message)> DeleteUser(string id)
        {
            var user = await _dbContext.Users.FindAsync(id);

            if (user == null) return (false, "No user found.");

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
            return (true, "User deleted successfully.");
        }
        public async Task<(bool Success, string Message)> UpdateUser(string id, UserUpdateModel updatedUser)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return (false, "No user found.");

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.UserName = updatedUser.UserName;
            user.NormalizedUserName = updatedUser.UserName.ToUpper();
            await _dbContext.SaveChangesAsync();
            return (true, "User updated successfully.");
        }
        public async Task<(bool Success, string Message, List<UserAdminPreviewModel> dataRetrieved)> GetAllUserEnqueries()
        {
            var enqueries = await _dbContext.Users
                                    .Select(c => new UserAdminPreviewModel(c))
                                    .ToListAsync();

            if (enqueries == null || enqueries.Count == 0)
            {
                return (false, "No user inquiries found.", null);
            }

            return (true, "User inquiries retrieved successfully.", enqueries);
        }
        public async Task<DashboardStatsDTO> GetDashboardStatsAsync()
        {
            var stats = new DashboardStatsDTO
            {
                TotalUsers = await _dbContext.Users.CountAsync(),
                TotalCamps = await _dbContext.Campsites.CountAsync(),
                TotalReviews = await _dbContext.Reviews.CountAsync()
            };

            return stats;
        }
        public async Task<(bool Success, string Message, List<ReviewDTO> dataRetrieved)> GetAllReviews()
        {
            var reviews = await _dbContext.Reviews
                .Include(r => r.User)
                .Include(r => r.Camp)
                .Select(r => new ReviewDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User.UserName,
                    CampId = r.CampId,
                    CampName = r.Camp.Name,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();

            if (!reviews.Any())
                return (false, "No reviews found.", null);

            return (true, "Reviews retrieved successfully.", reviews);
        }
    }
}