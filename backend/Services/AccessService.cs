using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Data;
using Microsoft.EntityFrameworkCore;
using VoteChain.Models;
using VoteChain.Interfaces;

namespace VoteChain.Services
{
    public class AccessService : IAccessService
    {
        private readonly ApplicationDbContext _context;

        public AccessService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ManageAccessAsync(ElectionAccess access)
        {
            _context.ElectionAccess.Add(access);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<ElectionAccess>> GetAccessListAsync(int electionId)
        {
            return await _context.ElectionAccess.Where(a => a.ElectionId == electionId).ToListAsync();
        }
    }
}
