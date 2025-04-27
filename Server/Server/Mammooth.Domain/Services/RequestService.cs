using Mammooth.Data.Context;
using Mammooth.Data.Entities;
using Mammooth.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mammooth.Domain.Services
{
    public class RequestService : IRequestService
    {
        private readonly AppDbContext _context;

        public RequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Campsites>> GetAvailableCampsAsync()
        {
            return await _context.Campsites.ToListAsync();
        }

        public async Task<Campsites> GetCampByIdAsync(string id)
        {
            return await _context.Campsites.FindAsync(id);
        }
    }
}