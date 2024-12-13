using System.ComponentModel.DataAnnotations;

namespace VoteChain.Models
{
    public class TransactionQueue
    {
        [Key]
        public int TransactionId { get; set; }         // Matches the database's TransactionId primary key
        public string JoinCode { get; set; }           // Related election join code
        public string ElectionId { get; set; }         // Election ID for tracking
        public string VoterAddress { get; set; }       // Ethereum address of the voter
        public string Status { get; set; }            // Status: Pending, UserSigned, Completed, Failed
        public decimal? GasFee { get; set; }           // Estimated gas fee for the transaction (nullable)
        public string? TransactionHash { get; set; }    // Blockchain transaction hash for tracking
        public string MerkleRoot { get; set; }         // Updated Merkle root after processing the vote
        public string? IpfsHash { get; set; }           // IPFS hash for vote storage
        public DateTime CreatedAt { get; set; }        // Timestamp when the transaction was created
        public DateTime UpdatedAt { get; set; }        // Timestamp for the last status update
    }

    public class ConfirmTransactionRequest
    {
        public int TransactionId { get; set; }
        public string TransactionHash { get; set; }
    }
}
