using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VoteChain.Data;
using VoteChain.Models;
using VoteChain.Services;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoteController : ControllerBase
    {

        private readonly ApplicationDbContext _context;
        private readonly IVoteService _voteService;
        private readonly IpfsService _ipfsService;

        public VoteController(ApplicationDbContext context, IVoteService voteService, IpfsService ipfsService)
        {
            _context = context;
            _voteService = voteService;
            _ipfsService = ipfsService;
        }

        [HttpPost("submit-to-queue")]
        public async Task<IActionResult> SubmitVoteToQueue([FromBody] Ballot ballot)
        {
            if (!ModelState.IsValid) return BadRequest("Invalid ballot data");
            await _voteService.SubmitVoteToQueueAsync(ballot);
            return Ok(new { message = "Vote queued successfully" });
        }

        [HttpGet("results/{joinCode}")]
        public async Task<IActionResult> GetElectionResults(string joinCode)
        {
            var results = await _voteService.GetElectionResultsFromIpfsAsync(joinCode);
            return Ok(results);
        }

        [HttpGet("transaction-data/{joinCode}/{voterAddress}")]
        public async Task<IActionResult> GetTransactionData(string joinCode, string voterAddress)
        {
            try
            {
                var transaction = await _context.TransactionQueue
                    .Where(t => t.JoinCode == joinCode && t.VoterAddress == voterAddress)
                    .OrderByDescending(t => t.CreatedAt)
                    .FirstOrDefaultAsync();

                if (transaction == null || transaction.Status != "Pending")
                {
                    return NotFound("No pending transaction found for this voter.");
                }

                return Ok(new
                {
                    electionId = transaction.ElectionId,
                    merkleRoot = transaction.MerkleRoot,
                    status = transaction.Status,
                    gasFee = transaction.GasFee ?? 0, // Default value for NULL
                    transactionHash = transaction.TransactionHash ?? "N/A", // Default value for NULL
                    ipfsHash = transaction.IpfsHash ?? "N/A" // Default value for NULL
                });
            }
            catch (System.Data.SqlTypes.SqlNullValueException ex)
            {
                Console.WriteLine($"Null value error: {ex.Message}");
                return StatusCode(500, "An error occurred while processing the transaction data.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred.");
            }
        }


        [HttpPost("confirm-transaction")]
        public async Task<IActionResult> ConfirmTransaction([FromBody] ConfirmTransactionRequest request)
        {
            var transaction = await _context.TransactionQueue
                .FirstOrDefaultAsync(t => t.TransactionId == request.TransactionId);

            if (transaction == null)
                return NotFound("Transaction not found.");

            if (transaction.Status != "Pending")
                return BadRequest("Transaction is already completed or failed.");

            // Update the status and save the transaction hash
            transaction.Status = "Completed";
            transaction.TransactionHash = request.TransactionHash;
            transaction.UpdatedAt = DateTime.UtcNow;

            // Submit to IPFS now
            var ipfsHash = await _ipfsService.UploadElectionDataAsync(transaction.MerkleRoot, transaction.VoterAddress);
            transaction.IpfsHash = ipfsHash;

            _context.TransactionQueue.Update(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transaction confirmed and finalized." });
        }
    }
}
