using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using VoteChain.Models;

namespace VoteChain.Models
{
    public class Election
    {
        [Key]
        public int ElectionId { get; set; }

        [Required]
        public string CreatorId { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        //[Required]
        public string? JoinCode { get; set; }  // Add this for the unique join code

        public ICollection<Position>? Positions { get; set; }

        public ICollection<ElectionAccess>? ElectionAccesses { get; set; }

        public string? MerkleRoot { get; set; } // Add this property

        public ICollection<IpfsFile> IpfsFiles { get; set; } // Navigation property

    }

    public class JoinElectionRequest
    {
        public string? JoinCode { get; set; }
    }
}
