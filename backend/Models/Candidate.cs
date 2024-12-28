using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoteChain.Models
{
    public class Candidate
    {
        [Key]
        public int CandidateId { get; set; }

        [Required]
        public int PositionId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Partylist { get; set; }

        public string? Details { get; set; }

        public string? ImageUrl { get; set; }

    }
}
