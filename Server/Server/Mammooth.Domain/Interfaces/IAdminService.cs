using Mammooth.Common.DTOs;
using Mammooth.Common.Requests.User;
using Mammooth.Common.Requests.Camps;
using Mammooth.Domain.DTOs;

namespace Mammooth.Domain.Interfaces
{
    public interface IAdminService
    {
        Task<(bool Success, string Message)> AddCamp(CreateCampRequest request);
        Task<(bool Success, string Message)> DeleteCamp(string id);
        Task<(bool Success, string Message)> UpdateCamp(string id, CampUpdateModel campUpdateModel);
        Task<(bool Success, string Message, List<CampAdminPreviewModel> dataRetrieved)> GetAllCampEnquieries();
        Task<(bool Success, string Message)> AddUser(CreateUserRequest request);
        Task<(bool Success, string Message)> DeleteUser(string id);
        Task<(bool Success, string Message)> UpdateUser(string id, UserUpdateModel userUpdateModel);
        Task<(bool Success, string Message, List<UserAdminPreviewModel> dataRetrieved)> GetAllUserEnqueries();
        Task<DashboardStatsDTO> GetDashboardStatsAsync();
        Task<(bool Success, string Message, List<ReviewDTO> dataRetrieved)> GetAllReviews();
    }
}