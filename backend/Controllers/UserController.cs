using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Nethereum.Signer;
using Newtonsoft.Json.Linq;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using VoteChain.Interfaces;
using VoteChain.Models;

namespace VoteChain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public UserController(IUserService userService, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _userService = userService;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User newUser)
        {
            var result = await _userService.RegisterUserAsync(newUser);

            if (result)
                return Ok(newUser);  // Return the user object with all required fields set by the service

            return BadRequest("Registration failed");
        }


        [HttpPost("kyc-verify")]
        public async Task<IActionResult> VerifyKYC([FromForm] KycVerificationRequest kycRequest)
        {
            bool isVerified = await _userService.PerformKycVerificationAsync(kycRequest);

            if (isVerified)
            {
                return Ok(new { message = "KYC verified successfully" });
            }
            else
            {
                return BadRequest(new { message = "KYC verification failed " + isVerified + " " + kycRequest });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (token, refreshToken) = await _userService.AuthenticateUserAsync(request);

            if (token != null && refreshToken != null)
            {
                return Ok(new { Token = token, RefreshToken = refreshToken });
            }
            return Unauthorized();
        }

        [HttpGet("request-nonce")]
        public async Task<IActionResult> RequestNonce([FromQuery] string walletAddress)
        {
            var nonce = await _userService.GenerateNonceAsync(walletAddress);
            return Ok(new { Nonce = nonce });
        }

        [HttpPost("verify-nonce")]
        public async Task<IActionResult> VerifyNonce([FromBody] VerifyNonceRequest request)
        {
            var (token, refreshToken) = await _userService.VerifyNonceAsync(request);

            // If either token or refreshToken is null, return unauthorized
            if (token != null && refreshToken != null)
                return Ok(new { Token = token, RefreshToken = refreshToken });

            return Unauthorized(new { error = "Signature verification failed" });
        }

        [HttpGet("checkUserExists")]
        public async Task<IActionResult> CheckUserExists([FromQuery] string walletAddress)
        {
            var user = await _userService.GetUserByPublicAddressAsync(walletAddress);
            if (user != null)
            {
                return Ok(user);
            }
            return NotFound();
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        private string GenerateJwtToken(string walletAddress)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, walletAddress),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryInMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequest tokenRequest)
        {
            var (newToken, newRefreshToken) = await _userService.RefreshTokenAsync(tokenRequest.RefreshToken);

            if (newToken == null || newRefreshToken == null)
                return Unauthorized("Invalid refresh token or token expired");

            return Ok(new { token = newToken, refreshToken = newRefreshToken });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (walletAddress == null)
            {
                return Unauthorized("Wallet address not found.");
            }

            var user = await _userService.GetUserByPublicAddressAsync(walletAddress);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                user.UserId,
                user.FirstName,
                user.LastName,
                user.Address,
                user.BirthDate,
                user.Email,
                user.WalletAddress  
            });
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateRequest request)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (walletAddress == null)
            {
                return Unauthorized("User identification failed.");
            }

            var user = await _userService.GetUserByPublicAddressAsync(walletAddress);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update the address and email only
            user.Address = request.Address;
            user.Email = request.Email;

            await _userService.UpdateUserAsync(user);

            return Ok("User updated successfully.");
        }
    }
}
