using Mammooth.Data.Entities;

namespace Mammooth.Data.Interfaces
{
    public interface IUserRepository
    {
        User GetById(string id);
    }
}