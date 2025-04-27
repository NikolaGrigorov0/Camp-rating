using Mammooth.Common.Requests.Auth;
using Mammooth.Data.Entities;

namespace Mammooth.Domain.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, string? JWT)> LoginAsync(CreateLoginRequest request);
        Task<(bool Success, string Message)> RegisterAsync(CreateRegisterRequest request);
        Task LogoutAsync();
        Task<(User? user, IList<string>? roles)> GetUserFromTokenAsync(string token);
    }
}