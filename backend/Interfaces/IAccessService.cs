using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;

namespace VoteChain.Interfaces
{
    public interface IAccessService
    {
        Task<bool> ManageAccessAsync(ElectionAccess access);
        Task<List<ElectionAccess>> GetAccessListAsync(int electionId);
    }
}
