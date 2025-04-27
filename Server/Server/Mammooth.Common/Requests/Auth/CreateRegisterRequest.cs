using System.ComponentModel.DataAnnotations;

namespace Mammooth.Common.Requests.Auth
{
    public class CreateRegisterRequest
    {
        [Required(ErrorMessage = "FirstName is required.")]
        [MinLength(3, ErrorMessage = "FirstName must be at least 3 characters.")]
        [MaxLength(20, ErrorMessage = "FirstName cannot be longer than 20 characters.")]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "LastName is required.")]
        [MinLength(3, ErrorMessage = "LastName must be at least 3 characters.")]
        [MaxLength(20, ErrorMessage = "LastName cannot be longer than 20 characters.")]
        public string LastName { get; set; } = null!;
        [Required(ErrorMessage = "Username is required.")]
        [MinLength(5, ErrorMessage = "Username must be at least 5 characters.")]
        [MaxLength(20, ErrorMessage = "Username cannot be longer than 20 characters.")]
        public string Username { get; set; } = null!;
        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        [MaxLength(30, ErrorMessage = "Password cannot be longer than 30 characters.")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Confirm password is required.")]
        [DataType(DataType.Password)]
        [Compare(nameof(Password), ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; } = null!;
    }
}