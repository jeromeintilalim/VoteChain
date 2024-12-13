using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;

namespace VoteChain.Interfaces
{
    public interface IPositionService
    {
        Task<bool> AddPositionAsync(Position position, string joinCode);
        Task<bool> UpdatePositionAsync(Position position);
        Task<bool> DeletePositionAsync(int positionId);
        Task<List<Position>> GetPositionsAsync(string joinCode);
    }
}
