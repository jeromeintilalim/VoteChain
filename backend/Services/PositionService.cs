using System.Threading.Tasks;
using VoteChain.Data;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.EntityFrameworkCore;

namespace VoteChain.Services
{
    public class PositionService : IPositionService
    {
        private readonly ApplicationDbContext _context;

        public PositionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddPositionAsync(Position position, string joinCode)
        {
            // Look up the Election by JoinCode
            var election = await _context.Elections.FirstOrDefaultAsync(e => e.JoinCode == joinCode);

            // If election is not found, throw an exception
            if (election == null)
            {
                throw new ArgumentException("Invalid JoinCode. The election does not exist.");
            }

            // Assign the ElectionId based on the JoinCode lookup
            position.ElectionId = election.ElectionId;

            // Assign the JoinCode to the position if needed
            position.JoinCode = joinCode;

            // Add the position to the context
            _context.Positions.Add(position);

            // Save changes
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> UpdatePositionAsync(Position position)
        {
            // Validate if ElectionId exists
            if (!await ElectionExistsAsync(position.ElectionId))
            {
                throw new ArgumentException("Invalid ElectionId. The election does not exist.");
            }

            _context.Positions.Update(position);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeletePositionAsync(int positionId)
        {
            var position = await _context.Positions.FindAsync(positionId);
            if (position == null)
                return false;

            _context.Positions.Remove(position);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<Position>> GetPositionsAsync(string joinCode)
        {
            var election = await _context.Elections.FirstOrDefaultAsync(e => e.JoinCode == joinCode);
            if (election == null)
            {
                throw new ArgumentException("Invalid JoinCode. The election does not exist.");
            }

            return await _context.Positions
                .Include(p => p.Candidates)
                .Where(p => p.ElectionId == election.ElectionId)
                .ToListAsync();
        }


        private async Task<bool> ElectionExistsAsync(int electionId)
        {
            return await _context.Elections.AnyAsync(e => e.ElectionId == electionId);
        }
    }
}
