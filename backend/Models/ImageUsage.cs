using System.ComponentModel.DataAnnotations;

namespace VoteChain.Models
{
    public class ImageUsage
    {
        [Key]
        public int ImageId { get; set; }  // Primary Key

        [Required]
        public string FileName { get; set; }  // Unique file name stored in the file system

        [Required]
        public string OriginalFileName { get; set; }  // Original file name from the user

        [Required]
        public int UsageCount { get; set; }  // Number of candidates using this image
    }
}
