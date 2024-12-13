using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;

namespace VoteChain.Interfaces
{
    public interface IElectionService
    {
        Task<bool> CreateElectionAsync(Election election);
        Task<bool> UpdateElectionAsync(Election election);
        Task<bool> DeleteElectionAsync(int electionId);
        Task<List<Election>> GetElectionsAsync();
        //Task<Election> GetElectionByIdAsync(int electionId);
        Task<Election> GetElectionByJoinCodeAsync(string joinCode);
        Task<bool> JoinElectionAsync(string joinCode, string userId);
        Task<List<Election>> GetElectionsByCreatorIdAsync(string creatorId);
        Task<List<Election>> GetElectionsByUserAsync(string userId);
        Task<bool> UnenrollElectionAsync(int electionId, string walletAddress);
        Task<List<EnrolledElectionDto>> GetEnrolledElectionsAsync(string walletAddress);

    }
}
