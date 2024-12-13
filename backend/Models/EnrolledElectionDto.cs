namespace VoteChain.Models
{
    public class EnrolledElectionDto
    {
        public int ElectionId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string JoinCode { get; set; }
        public bool HasVoted { get; set; }
        public bool IsEnrolled { get; set; }
    }
}
