namespace Register.ViewModels
{
    public class RegisterViewModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Day { get; set; } // Day of birth
        public string Month { get; set; } // Month of birth
        public int Year { get; set; } // Year of birth
        public string ContactNumber { get; set; }
        public string StudentNumber { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; } // For password confirmation
        public bool TermsAccepted { get; set; } // For terms and conditions checkbox
    }

    public class LoginViewModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
