using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoteChain.Models
{
    public class Position
    {
        [Key]
        public int PositionId { get; set; }

        [Required]
        public int ElectionId { get; set; }

        [Required]
        public string JoinCode { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        public ICollection<Candidate>? Candidates { get; set; }

        [Required]
        public int MaxSelection { get; set; } // Add this line

        // Add the Election navigation property
        //[ForeignKey("ElectionId")]
        //public Election? Election { get; set; }  // Navigation property to Election
    }
}
