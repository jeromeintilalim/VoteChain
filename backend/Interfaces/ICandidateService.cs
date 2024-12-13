using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;
using Microsoft.AspNetCore.Http;

namespace VoteChain.Interfaces
{
    public interface ICandidateService
    {
        Task<bool> AddCandidateAsync(Candidate candidate, IFormFile? image);
        Task<bool> UpdateCandidateAsync(Candidate candidate, IFormFile? image, bool removeImage);
        Task<bool> DeleteCandidateAsync(int candidateId);
        Task<List<Candidate>> GetCandidatesAsync(int positionId);
        Task<Candidate> GetCandidateByIdAsync(int candidateId);
    }
}
