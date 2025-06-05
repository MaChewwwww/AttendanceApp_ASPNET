namespace AttendanceApp_ASPNET.Models
{
    // ENCAPSULATION: Simple data class that encapsulates configuration properties
    // ABSTRACTION: Represents API configuration without exposing how it's used
    public class ApiSettings
    {
        // ENCAPSULATION: Properties provide controlled access to private backing fields
        // POLYMORPHISM: string type can hold various API key formats
        public string ApiKey { get; set; } = string.Empty;
        
        // ENCAPSULATION: Property encapsulates URL validation and formatting logic
        public string ApiBaseUrl { get; set; } = string.Empty;
        
        // INHERITANCE: Implicitly inherits from System.Object
        // Gets ToString(), Equals(), GetHashCode(), etc.
    }
}
