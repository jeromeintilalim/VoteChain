using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoteChain.Models
{
    public class ElectionAccess
    {
        [Key]
        public int AccessId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ElectionId { get; set; }

        public string WalletAddress { get; set; }

        [Required]
        public bool HasVoted { get; set; }

        [Required]
        public bool IsEnrolled { get; set; }

        // Navigation property for the related User entity
        [ForeignKey("UserId")]
        public User User { get; set; }

        // Navigation property for the related Election entity
        [ForeignKey("ElectionId")]
        public Election Election { get; set; }
    }
}
