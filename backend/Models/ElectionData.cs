namespace VoteChain.Models
{
    public class ElectionData
    {
        public int ElectionId { get; set; }
        public string JoinCode { get; set; }
        public string MerkleRoot { get; set; }
        public List<BallotData> Ballots { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class BallotData
    {
        public int BallotId { get; set; }
        public string VoterAddress { get; set; }
        public DateTime Timestamp { get; set; }
        public List<VoteData> Votes { get; set; }
    }

    public class VoteData
    {
        public int PositionId { get; set; }
        public int CandidateId { get; set; }
    }
}
