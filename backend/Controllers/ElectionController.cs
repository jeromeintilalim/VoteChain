using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.AspNetCore.Authorization;
using static System.Collections.Specialized.BitVector32;
using System.ComponentModel.Design;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using VoteChain.Services;
using System.Security.Claims;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElectionController : ControllerBase
    {
        private readonly IElectionService _electionService;

        public ElectionController(IElectionService electionService)
        {
            _electionService = electionService;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateElection([FromBody] Election election)
        {
            var result = await _electionService.CreateElectionAsync(election);
            if (result)
                return Ok();
            return BadRequest("Election creation failed");
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateElection([FromBody] Election election)
        {
            var result = await _electionService.UpdateElectionAsync(election);
            if (result)
                return Ok();
            return BadRequest("Updating election failed");
        }

        [Authorize]
        [HttpDelete("delete/{electionId}")]
        public async Task<IActionResult> DeleteElection(int electionId)
        {
            var result = await _electionService.DeleteElectionAsync(electionId);
            if (result)
                return Ok();
            return BadRequest("Deleting election failed");
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet]
        public async Task<IActionResult> GetElections()
        {
            var elections = await _electionService.GetElectionsAsync();
            return Ok(elections);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{joinCode}")]
        public async Task<IActionResult> GetElectionByJoinCode(string joinCode)
        {
            var election = await _electionService.GetElectionByJoinCodeAsync(joinCode);
            if (election == null)
                return NotFound();
            return Ok(election);
        }

        [Authorize]
        [HttpPost("join")]
        public async Task<IActionResult> JoinElection([FromBody] JoinElectionRequest request)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (walletAddress == null)
            {
                return Unauthorized("Wallet address not found.");
            }

            var result = await _electionService.JoinElectionAsync(request.JoinCode, walletAddress);

            if (result)
            {
                return Ok(new { message = "Successfully joined the election." });
            }

            return BadRequest("Failed to join the election. Either the JoinCode is invalid, or you are already enrolled.");
        }


        [Authorize]
        [HttpGet("userElections")]
        public async Task<IActionResult> GetElectionsByCreatorId()
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (walletAddress == null)
            {
                return Unauthorized(new { error = "User identification failed." });
            }

            var elections = await _electionService.GetElectionsByCreatorIdAsync(walletAddress);
            return Ok(elections);
        }

        [Authorize]
        [HttpGet("enrolled")]
        public async Task<IActionResult> GetEnrolledElections()
        {
            // Get the wallet address from the authenticated user's claims
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (walletAddress == null)
            {
                return Unauthorized(new { error = "User not found." });
            }

            // Fetch the enrolled elections
            var elections = await _electionService.GetEnrolledElectionsAsync(walletAddress);

            // Return the enrolled elections
            return Ok(elections);
        }

        [Authorize]
        [HttpDelete("unenroll/{electionId}")]
        public async Task<IActionResult> UnenrollElection(int electionId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (walletAddress == null)
            {
                return Unauthorized(new { error = "User not found." });
            }

            var result = await _electionService.UnenrollElectionAsync(electionId, walletAddress);

            if (result)
            {
                return Ok(new { message = "Successfully unenrolled from the election." });
            }

            return BadRequest("Failed to unenroll from the election.");
        }

    }
}
