using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace VoteChain.Controllers
{
    [Route("api/ipfs")]
    [ApiController]
    public class IpfsController : ControllerBase
    {
        private readonly IpfsService _ipfsService;

        public IpfsController(IpfsService ipfsService)
        {
            _ipfsService = ipfsService;
        }

        public class IpfsRequest
        {
            public string fileContent { get; set; }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadToIpfs([FromBody] IpfsRequest request)
        {
            Console.WriteLine($"Received request: {request.fileContent}");
            if (string.IsNullOrEmpty(request.fileContent))
                return BadRequest("Invalid file content");

            try
            {
                // Decode Base64 string to byte[]
                byte[] fileBytes = Convert.FromBase64String(request.fileContent);

                // Upload to Pinata
                var ipfsHash = await _ipfsService.UploadToPinataAsync(fileBytes);

                return Ok(new { ipfsHash });
            }
            catch (FormatException)
            {
                return BadRequest("Invalid Base64 string");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while uploading to Pinata: {ex.Message}");
            }
        }
    }
}
