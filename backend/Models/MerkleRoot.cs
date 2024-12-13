using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoteChain.Models
{
    public class MerkleRoot
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ElectionId { get; set; }

        [Required]
        [StringLength(64)]
        public string MerkleRootHash { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        // Navigation property
        [ForeignKey(nameof(ElectionId))]
        public Election Election { get; set; }
    }
}
