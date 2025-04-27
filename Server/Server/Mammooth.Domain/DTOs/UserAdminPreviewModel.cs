using Mammooth.Data.Entities;

namespace Mammooth.Common.DTOs
{
    public class UserAdminPreviewModel
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string NormalizedUserName { get; set; }

        public UserAdminPreviewModel(User user)
        {
            Id = user.Id;
            FirstName = user.FirstName;
            LastName = user.LastName;
            UserName = user.UserName;
            NormalizedUserName = user.NormalizedUserName;
        }
    }
}