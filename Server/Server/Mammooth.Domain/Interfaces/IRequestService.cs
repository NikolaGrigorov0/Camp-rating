using Mammooth.Data.Entities;

namespace Mammooth.Domain.Interfaces
{
    public interface IRequestService
    {
        Task<List<Campsites>> GetAvailableCampsAsync();
        Task<Campsites> GetCampByIdAsync(string id);
    }
}