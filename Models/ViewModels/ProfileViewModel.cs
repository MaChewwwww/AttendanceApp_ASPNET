using System.ComponentModel.DataAnnotations;

public class ProfileViewModel
{
    [Required(ErrorMessage = "Student number is required.")]
    public string StudentNumber { get; set; }

    [Required(ErrorMessage = "Role is required.")]
    public string Role { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    public string Name { get; set; }


    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; }

    public string? FaceImage { get; set; } // This is for storing the image as a string (e.g., base64 or path)
}
