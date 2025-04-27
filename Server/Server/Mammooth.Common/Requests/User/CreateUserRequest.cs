using System.ComponentModel.DataAnnotations;

namespace Mammooth.Common.Requests.User
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "First name is required.")]
        public required string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        public required string LastName { get; set; }
        [Required(ErrorMessage = "User name is required.")]
        public required string UserName { get; set; }
    }
}