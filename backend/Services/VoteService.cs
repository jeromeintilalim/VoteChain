using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using VoteChain.Data;
using VoteChain.Interfaces;
using VoteChain.Models;

namespace VoteChain.Services
{
    public class VoteService : IVoteService
    {
        private readonly ApplicationDbContext _context;
        private readonly MerkleTreeService _merkleTreeService;
        private readonly IpfsService _ipfsService;
        private readonly RabbitMQService _rabbitMQService;

        public VoteService(ApplicationDbContext context, MerkleTreeService merkleTreeService, IpfsService ipfsService, RabbitMQService rabbitMQService)
        {
            _context = context;
            _merkleTreeService = merkleTreeService;
            _ipfsService = ipfsService;
            _rabbitMQService = rabbitMQService;
        }

        // Implementation for CastBallotAsync
        public async Task<bool> CastBallotAsync(Ballot ballot)
        {
            // Step 1: Validate the election
            var election = await _context.Elections.FirstOrDefaultAsync(e => e.JoinCode == ballot.JoinCode);
            if (election == null)
                throw new InvalidOperationException($"Election with JoinCode {ballot.JoinCode} does not exist.");

            // Step 2: Prevent duplicate ballots
            var existingBallot = await _context.Ballots
                .FirstOrDefaultAsync(b => b.UserId == ballot.UserId && b.JoinCode == ballot.JoinCode);
            if (existingBallot != null)
                throw new InvalidOperationException("You have already voted in this election.");

            // Step 3: Save the ballot and associated votes
            foreach (var vote in ballot.Votes)
                vote.Ballot = ballot;

            _context.Ballots.Add(ballot);
            await _context.SaveChangesAsync();

            // Step 4: Recompute the Merkle tree
            var ballots = await _context.Ballots
                .Where(b => b.JoinCode == ballot.JoinCode)
                .ToListAsync();
            _merkleTreeService.GenerateTreeFromBallots(ballots);

            // Step 5: Update IPFS
            var merkleRoot = _merkleTreeService.GetMerkleRoot();
            await _ipfsService.UploadElectionDataAsync(merkleRoot, ballot.VoterAddress);

            return true;
        }

        public async Task<bool> SubmitVoteToQueueAsync(Ballot ballot)
        {
            // Push vote data into RabbitMQ queue
            await _rabbitMQService.EnqueueVoteAsync(ballot);
            return true;
        }

        public async Task<List<Ballot>> GetVotesByElectionAsync(string joinCode)
        {
            return await _context.Ballots
                .Include(b => b.Votes)
                .Where(b => b.JoinCode == joinCode)
                .ToListAsync();
        }

        public async Task<List<Result>> GetElectionResultsFromIpfsAsync(string joinCode)
        {
            var ipfsRecord = await _context.IpfsFiles
                .FirstOrDefaultAsync(f => f.JoinCode == joinCode);

            if (ipfsRecord == null)
                throw new InvalidOperationException($"No IPFS data found for election with JoinCode: {joinCode}");

            string ipfsData = await _ipfsService.GetFromPinataAsync(ipfsRecord.IpfsHash);
            var electionData = JsonConvert.DeserializeObject<ElectionData>(ipfsData);

            if (electionData.JoinCode != joinCode)
                throw new InvalidOperationException("JoinCode mismatch. Data integrity issue detected.");

            return electionData.Ballots
                .SelectMany(b => b.Votes)
                .GroupBy(v => new { v.PositionId, v.CandidateId })
                .Select(g => new Result
                {
                    PositionId = g.Key.PositionId,
                    CandidateId = g.Key.CandidateId,
                    VoteCount = g.Count(),
                    CandidateName = _context.Candidates.FirstOrDefault(c => c.CandidateId == g.Key.CandidateId)?.Name ?? "Unknown",
                    CandidateImage = _context.Candidates.FirstOrDefault(c => c.CandidateId == g.Key.CandidateId)?.ImageUrl
                })
                .ToList();
        }

        public List<string> GenerateMerkleProofForBallot(Ballot ballot)
        {
            return _merkleTreeService.GetMerkleProof(ballot);
        }

        public string GetMerkleRootForElection(List<Ballot> ballots)
        {
            _merkleTreeService.GenerateTreeFromBallots(ballots);
            return _merkleTreeService.GetMerkleRoot();
        }
    }
}
