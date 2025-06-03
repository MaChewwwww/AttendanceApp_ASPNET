using Newtonsoft.Json;

public class User
{
    [JsonProperty("user_id")]
    public string UserId { get; set; }

    [JsonProperty("first_name")]
    public string FirstName { get; set; }

    [JsonProperty("middle_name")]
    public string MiddleName { get; set; }

    [JsonProperty("last_name")]
    public string LastName { get; set; }

    [JsonProperty("email")]
    public string Email { get; set; }

    [JsonProperty("role")]
    public string Role { get; set; }

    [JsonProperty("student_number")]
    public string StudentNumber { get; set; }

    [JsonProperty("face_image")]
    public string FaceImage { get; set; }

    [JsonProperty("status")]
    public string Status { get; set; }
}
