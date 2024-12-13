using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.AspNetCore.Authorization;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PositionController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddPosition([FromBody] Position position, [FromQuery] string joinCode)
        {
            if (string.IsNullOrEmpty(joinCode))
            {
                return BadRequest(new { message = "JoinCode is required." });
            }

            var result = await _positionService.AddPositionAsync(position, joinCode);

            if (result)
            {
                // Return the added position as JSON
                return Ok(position);
            }

            return BadRequest("Adding position failed");
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdatePosition([FromBody] Position position)
        {
            var result = await _positionService.UpdatePositionAsync(position);
            if (result)
                return Ok();
            return BadRequest("Updating position failed");
        }

        [Authorize]
        [HttpDelete("delete/{positionId}")]
        public async Task<IActionResult> DeletePosition(int positionId)
        {
            var result = await _positionService.DeletePositionAsync(positionId);
            if (result)
                return Ok();
            return BadRequest("Deleting position failed");
        }

        [Authorize]
        [HttpGet("{joinCode}")]
        public async Task<IActionResult> GetPositions(string joinCode)
        {
            var positions = await _positionService.GetPositionsAsync(joinCode);
            return Ok(positions);
        }

    }
}
