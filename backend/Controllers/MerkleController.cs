using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VoteChain.Data;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.EntityFrameworkCore;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MerkleController : ControllerBase
    {
        private readonly MerkleTreeService _merkleTreeService;
        private readonly IVoteService _voteService;
        private readonly ApplicationDbContext _context;

        // Updated constructor to inject ApplicationDbContext
        public MerkleController(MerkleTreeService merkleTreeService, IVoteService voteService, ApplicationDbContext context)
        {
            _merkleTreeService = merkleTreeService;
            _voteService = voteService;
            _context = context; // Injected context
        }

        [HttpPost("generate-proof")]
        public IActionResult GenerateMerkleProof([FromBody] Ballot ballot)
        {
            if (ballot == null || ballot.Votes == null || !ballot.Votes.Any())
                return BadRequest("Invalid ballot data");

            var ballots = _voteService.GetVotesByElectionAsync(ballot.JoinCode).Result;
            if (!ballots.Any())
            {
                _merkleTreeService.InitializeDefaultTree();
            }

            var proof = _voteService.GenerateMerkleProofForBallot(ballot);
            return Ok(new { proof });
        }

        [HttpGet("merkle-root/{joinCode}")]
        public async Task<IActionResult> GetMerkleRoot(string joinCode)
        {
            // Ensure ballots are fetched correctly
            var ballots = await _context.Ballots.Where(b => b.JoinCode == joinCode).ToListAsync();

            if (!ballots.Any())
            {
                _merkleTreeService.InitializeDefaultTree();
                var root = _merkleTreeService.GetMerkleRoot();
                Console.WriteLine($"Generated Default Merkle Root: {root}");
                return Ok(new { merkleRoot = root });
            }

            var rootWithBallots = _merkleTreeService.GetMerkleRootForElection(ballots);
            Console.WriteLine($"Generated Merkle Root from Ballots: {rootWithBallots}");
            return Ok(new { merkleRoot = rootWithBallots });
        }


        [HttpPost("cast-vote")]
        public async Task<IActionResult> CastVote([FromBody] Ballot ballot)
        {
            if (ballot == null || ballot.Votes == null || !ballot.Votes.Any())
                return BadRequest("Invalid ballot data");

            try
            {
                // Step 1: Cast the ballot
                var success = await _voteService.CastBallotAsync(ballot);
                if (!success)
                    return BadRequest("Failed to cast vote.");

                // Step 2: Get updated Merkle root
                var ballots = await _voteService.GetVotesByElectionAsync(ballot.JoinCode);
                var merkleRoot = _voteService.GetMerkleRootForElection(ballots);

                // Step 3: Retrieve the latest IPFS record for this election
                var ipfsRecord = await _context.IpfsFiles
                    .Where(f => f.JoinCode == ballot.JoinCode)
                    .OrderByDescending(f => f.UploadedAt)
                    .FirstOrDefaultAsync();

                if (ipfsRecord == null)
                    throw new InvalidOperationException("IPFS record not found for the election.");

                // Step 4: Return both merkleRoot and ipfsHash to the frontend
                return Ok(new
                {
                    merkleRoot,
                    ipfsHash = ipfsRecord.IpfsHash
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
