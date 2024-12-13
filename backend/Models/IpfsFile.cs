using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoteChain.Models
{
    public class IpfsFile
    {
        [Key]
        public int Id { get; set; }

        public int ElectionId { get; set; } // Foreign Key to Elections table

        [Required]
        [StringLength(255)]
        public string JoinCode { get; set; } // Added for easier querying and IPFS metadata

        [Required]
        [StringLength(255)]
        public string IpfsHash { get; set; }

        public DateTime UploadedAt { get; set; }

        // Navigation property
        [ForeignKey(nameof(ElectionId))]
        public Election Election { get; set; }
    }
}
