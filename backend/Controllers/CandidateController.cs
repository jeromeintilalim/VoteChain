using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateService _candidateService;

        public CandidateController(ICandidateService candidateService)
        {
            _candidateService = candidateService;
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddCandidate([FromForm] Candidate candidate, IFormFile? image)
        {
            try
            {
                var result = await _candidateService.AddCandidateAsync(candidate, image);
                if (result)
                {
                    return Ok(new { success = true, message = $"Candidate added successfully. image: {image}" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Invalid PositionId or other data provided." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"An error occurred: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateCandidate([FromForm] Candidate candidate, IFormFile? image, [FromForm] bool removeImage)
        {
            try
            {
                var result = await _candidateService.UpdateCandidateAsync(candidate, image, removeImage);
                if (result)
                {
                    return Ok(new { success = true, message = "Candidate updated successfully." });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Updating candidate failed. Ensure that the candidate ID is valid and that all required fields are provided." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"An error occurred: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpDelete("delete/{candidateId}")]
        public async Task<IActionResult> DeleteCandidate(int candidateId)
        {
            var result = await _candidateService.DeleteCandidateAsync(candidateId);
            if (result)
                return Ok();
            return BadRequest("Deleting candidate failed");
        }

        [Authorize]
        [HttpGet("{positionId}")]
        public async Task<IActionResult> GetCandidates(int positionId)
        {
            var candidates = await _candidateService.GetCandidatesAsync(positionId);
            return Ok(candidates);
        }
    }
}
