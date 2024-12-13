using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.AspNetCore.Authorization;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccessController : ControllerBase
    {
        private readonly IAccessService _accessService;

        public AccessController(IAccessService accessService)
        {
            _accessService = accessService;
        }

        [Authorize]
        [HttpPost("manage")]
        public async Task<IActionResult> ManageAccess([FromBody] ElectionAccess access)
        {
            var result = await _accessService.ManageAccessAsync(access);
            if (result)
                return Ok();
            return BadRequest("Managing access failed");
        }

        [Authorize]
        [HttpGet("{electionId}")]
        public async Task<IActionResult> GetAccessList(int electionId)
        {
            var accessList = await _accessService.GetAccessListAsync(electionId);
            return Ok(accessList);
        }
    }
}
