using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Data;
using Microsoft.EntityFrameworkCore;
using VoteChain.Models;
using VoteChain.Interfaces;
using System.Transactions;
using Microsoft.Data.SqlClient;

namespace VoteChain.Services
{
    public class ElectionService : IElectionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ElectionService> _logger;

        public ElectionService(ApplicationDbContext context, ILogger<ElectionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> CreateElectionAsync(Election election)
        {
            try
            {
                var joinCodeParameter = new SqlParameter("@JoinCode", System.Data.SqlDbType.NVarChar, 8)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                var insertedIdParameter = new SqlParameter("@InsertedId", System.Data.SqlDbType.Int)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                var parameters = new[]
                {
                    new SqlParameter("@CreatorId", election.CreatorId),
                    new SqlParameter("@Description", (object)election.Description ?? DBNull.Value),
                    new SqlParameter("@EndDate", election.EndDate),
                    joinCodeParameter,
                    new SqlParameter("@StartDate", election.StartDate),
                    new SqlParameter("@Title", election.Title),
                    insertedIdParameter
                };

                var result = await _context.Database.ExecuteSqlRawAsync(
                    "EXEC InsertElection @CreatorId, @Description, @EndDate, @JoinCode OUTPUT, @StartDate, @Title, @InsertedId OUTPUT",
                    parameters);

                // If the result is greater than 0, return true (indicating success)
                return result > 0;
            }
            catch (SqlException ex)
            {
                if (ex.Number == 2627) // Unique constraint violation
                {
                    _logger.LogError(ex, "Failed to create election due to duplicate JoinCode");
                    return false;
                }
                throw;
            }
        }

        private string GenerateJoinCode(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public async Task<bool> UpdateElectionAsync(Election election)
        {
            _context.Elections.Update(election);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteElectionAsync(int electionId)
        {
            var election = await _context.Elections.FindAsync(electionId);
            if (election == null)
                return false;

            _context.Elections.Remove(election);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<Election>> GetElectionsAsync()
        {
            return await _context.Elections.Include(e => e.Positions).ToListAsync();
        }

        //public async Task<Election> GetElectionByIdAsync(int electionId)
        //{
        //    return await _context.Elections.Include(e => e.Positions)
        //                                   .ThenInclude(p => p.Candidates)
        //                                   .FirstOrDefaultAsync(e => e.ElectionId == electionId);
        //}

        public async Task<Election> GetElectionByJoinCodeAsync(string joinCode)
        {
            return await _context.Elections.Include(e => e.Positions)
                                           .ThenInclude(p => p.Candidates)
                                           .FirstOrDefaultAsync(e => e.JoinCode == joinCode);
        }

        public async Task<bool> JoinElectionAsync(string joinCode, string walletAddress)
        {
            // Fetch the election using the join code
            var election = await _context.Elections.FirstOrDefaultAsync(e => e.JoinCode == joinCode);
            if (election == null)
            {
                return false; // Election does not exist
            }

            // Check if the user is the creator of the election
            if (election.CreatorId == walletAddress)
            {
                // The creator is trying to join their own election, prevent this
                return false;
            }

            // Fetch the user based on the wallet address
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);
            if (user == null)
            {
                return false; // User does not exist
            }

            // Check if the user is already enrolled or previously unenrolled
            var electionAccess = await _context.ElectionAccess
                .FirstOrDefaultAsync(ea => ea.ElectionId == election.ElectionId && ea.UserId == user.UserId);

            if (electionAccess != null)
            {
                // If the user was previously unenrolled, re-enroll them by setting IsEnrolled to true
                if (!electionAccess.IsEnrolled)
                {
                    electionAccess.IsEnrolled = true;
                    await _context.SaveChangesAsync();
                    return true; // Re-enrolled successfully
                }

                return false; // User is already enrolled
            }

            // If the user is enrolling for the first time, add a new entry
            var newElectionAccess = new ElectionAccess
            {
                ElectionId = election.ElectionId,
                UserId = user.UserId,
                WalletAddress = walletAddress,
                IsEnrolled = true, // New enrollment
                HasVoted = false    // Default to not voted
            };

            _context.ElectionAccess.Add(newElectionAccess);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Election>> GetElectionsByCreatorIdAsync(string creatorId)
        {
            return await _context.Elections
                                 .Include(e => e.Positions)
                                 .Where(e => e.CreatorId == creatorId) // Filter by CreatorId (WalletAddress)
                                 .ToListAsync();
        }

        public async Task<List<Election>> GetElectionsByUserAsync(string walletAddress)
        {
            return await _context.ElectionAccess
                .Where(ea => ea.User.WalletAddress == walletAddress)
                .Include(ea => ea.Election)  // Ensure you include related Election data
                .Select(ea => ea.Election)   // Select the Election from the ElectionAccess
                .ToListAsync();
        }

        public async Task<bool> UnenrollElectionAsync(int electionId, string walletAddress)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);
            if (user == null)
            {
                return false; // User not found
            }

            var electionAccess = await _context.ElectionAccess
                .FirstOrDefaultAsync(ea => ea.ElectionId == electionId && ea.UserId == user.UserId);

            if (electionAccess == null)
            {
                return false; // The user is not enrolled in the election
            }

            // Mark the user as unenrolled, but do not delete the record to retain the voting information.
            electionAccess.IsEnrolled = false;

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> CastVoteAsync(int electionId, string walletAddress, List<int> selectedCandidates)
        {
            // Fetch the user based on the wallet address
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);
            if (user == null)
            {
                return false; // User not found
            }

            // Fetch the user's election access entry to check if they have already voted
            var electionAccess = await _context.ElectionAccess
                .FirstOrDefaultAsync(ea => ea.ElectionId == electionId && ea.UserId == user.UserId);

            if (electionAccess == null)
            {
                return false; // User is not enrolled in the election
            }

            // Check if the user has already voted
            if (electionAccess.HasVoted)
            {
                return false; // User has already voted
            }

            // Cast the vote logic here, e.g., store the selected candidates

            // Mark the user as having voted
            electionAccess.HasVoted = true;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<EnrolledElectionDto>> GetEnrolledElectionsAsync(string walletAddress)
        {
            return await _context.ElectionAccess
                .Where(ea => ea.User.WalletAddress == walletAddress && ea.IsEnrolled)  // Filter only enrolled elections
                .Include(ea => ea.Election)  // Join with Election data
                .Select(ea => new EnrolledElectionDto
                {
                    ElectionId = ea.Election.ElectionId,
                    Title = ea.Election.Title,
                    Description = ea.Election.Description,
                    StartDate = ea.Election.StartDate,
                    EndDate = ea.Election.EndDate,
                    JoinCode = ea.Election.JoinCode,
                    HasVoted = ea.HasVoted,    // From ElectionAccess table
                    IsEnrolled = ea.IsEnrolled // From ElectionAccess table
                })
                .ToListAsync();
        }
    }
}
