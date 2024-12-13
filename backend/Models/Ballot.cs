using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VoteChain.Models
{
    public class Ballot
    {
        [Key]
        public int BallotId { get; set; }

        [Required]
        public int UserId { get; set; } // Represents the voter

        [Required]
        public string JoinCode { get; set; } // Reference the unique join code

        [Required]
        public string VoterAddress { get; set; } // Ethereum address of the voter

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation property
        public List<VoteEntry> Votes { get; set; } = new();
    }

    public class VoteEntry
    {
        [Key]
        public int VoteEntryId { get; set; }

        [ForeignKey("Ballot")]
        public int BallotId { get; set; }

        [JsonIgnore]
        public Ballot? Ballot { get; set; }

        [Required]
        public int PositionId { get; set; }

        [Required]
        public int CandidateId { get; set; }
    }


    public class Result
    {
        public int PositionId { get; set; }
        public int CandidateId { get; set; }
        public int VoteCount { get; set; }
        public string CandidateName { get; set; } // New field
        public string CandidateImage { get; set; } // New field
    }
}
