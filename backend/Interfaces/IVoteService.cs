using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;

public interface IVoteService
{
    Task<bool> CastBallotAsync(Ballot ballot); // Add this missing method
    Task<bool> SubmitVoteToQueueAsync(Ballot ballot); // Already implemented
    Task<List<Ballot>> GetVotesByElectionAsync(string joinCode);
    Task<List<Result>> GetElectionResultsFromIpfsAsync(string joinCode);
    List<string> GenerateMerkleProofForBallot(Ballot ballot);
    string GetMerkleRootForElection(List<Ballot> ballots);
}
