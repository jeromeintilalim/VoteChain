using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;
using VoteChain.Data;
using VoteChain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Nethereum.Signer;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;

namespace VoteChain.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public UserService(ApplicationDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        // Register user with additional KYC details
        public async Task<bool> RegisterUserAsync(User user)
        {
            // Set Nonce and RefreshToken only in RegisterUserAsync
            user.Nonce = new Random().Next(100000, 999999).ToString();
            user.RefreshToken = GenerateRefreshToken();
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Set expiry time for the refresh token

            _context.Users.Add(user);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        // Authenticate user using wallet address and signature
        public async Task<(string token, string refreshToken)> AuthenticateUserAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == request.WalletAddress);
            if (user == null) return (null, null);

            // Generate the tokens
            var token = GenerateJwtToken(user.WalletAddress);
            var refreshToken = GenerateRefreshToken();
            Console.WriteLine($"Token: {token}, RefreshToken: {refreshToken}");  // Add logging to check tokens

            // Store refresh token in database
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Set refresh token expiry
            await _context.SaveChangesAsync();

            return (token, refreshToken);
        }

        public async Task<bool> PerformKycVerificationAsync(KycVerificationRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == request.WalletAddress);

            try
            {
                // Step 1: Send ID document to OpenKYC for verification
                var client = _httpClientFactory.CreateClient();
                var formData = new MultipartFormDataContent
        {
            { new StreamContent(request.IdDocument.OpenReadStream()), "image", request.IdDocument.FileName }
        };

                client.DefaultRequestHeaders.Add("x-rapidapi-key", "0472b0fdb5msh81905e82d03689ep172e6djsndf020f755851");
                client.DefaultRequestHeaders.Add("x-rapidapi-host", "id-document-recognition2.p.rapidapi.com");

                var response = await client.PostAsync("https://id-document-recognition2.p.rapidapi.com/api/iddoc", formData);
                var openKycResult = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"ID Verification failed: {openKycResult}");
                    return false;
                }

                var openKycData = JObject.Parse(openKycResult);

                // Step 2: Extract portrait from ID document (Base64 encoded)
                var portraitBase64 = openKycData["data"]["image"]["portrait"].ToString();

                // Step 3: Convert selfie to Base64 and add MIME type
                string selfieBase64;
                using (var memoryStream = new MemoryStream())
                {
                    await request.Selfie.CopyToAsync(memoryStream);
                    selfieBase64 = Convert.ToBase64String(memoryStream.ToArray());  // Convert selfie to Base64
                }

                // Prepend MIME type to Base64 strings
                var portraitDataUrl = $"data:image/png;base64,{portraitBase64}";  // Assuming the image is in PNG format
                var selfieDataUrl = $"data:image/png;base64,{selfieBase64}";      // Assuming the selfie is in PNG format

                // Step 4: Prepare the face verification API request with Base64 images
                var faceVerificationClient = _httpClientFactory.CreateClient();
                var faceFormData = new MultipartFormDataContent
        {
            { new StringContent(portraitDataUrl), "image1Base64" },  // ID portrait with MIME type
            { new StringContent(selfieDataUrl), "image2Base64" }     // Selfie with MIME type
        };

                faceVerificationClient.DefaultRequestHeaders.Add("x-rapidapi-key", "0472b0fdb5msh81905e82d03689ep172e6djsndf020f755851");
                faceVerificationClient.DefaultRequestHeaders.Add("x-rapidapi-host", "face-verification2.p.rapidapi.com");

                var faceResponse = await faceVerificationClient.PostAsync("https://face-verification2.p.rapidapi.com/faceverification", faceFormData);
                var faceVerificationResult = await faceResponse.Content.ReadAsStringAsync();

                if (!faceResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Face Verification failed: {faceVerificationResult}");
                    return false;
                }

                var faceData = JObject.Parse(faceVerificationResult);

                // Ensure that "data" and "similarPercent" exist in the response
                if (faceData["data"] != null && faceData["data"]["similarPercent"] != null)
                {
                    var similarityScore = double.Parse(faceData["data"]["similarPercent"].ToString());

                    if (similarityScore >= 0.75)
                    {
                        // If similarity is high, mark the user as KYC verified
                        await _context.SaveChangesAsync();
                        return true;
                    }
                    else
                    {
                        Console.WriteLine($"Face similarity too low: {similarityScore}");
                        return false;
                    }
                }
                else
                {
                    Console.WriteLine("Error: 'data' or 'similarPercent' not found in the face verification response.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during KYC verification: {ex.Message}");
                return false;
            }
        }

        // Generate nonce for signing
        public async Task<string> GenerateNonceAsync(string walletAddress)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);
            if (user == null)
            {
                user = new User
                {
                    WalletAddress = walletAddress,
                    Nonce = new Random().Next(100000, 999999).ToString()
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update nonce if user already exists
                user.Nonce = new Random().Next(100000, 999999).ToString();
                await _context.SaveChangesAsync();
            }

            return user.Nonce;
        }

        // Verify nonce and generate JWT token
        public async Task<(string token, string refreshToken)> VerifyNonceAsync(VerifyNonceRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == request.WalletAddress);

            if (user == null) return (null, null);

            // Construct the message to be signed
            var message = $"I am signing my one-time nonce: {user.Nonce}";

            // Verify the signature using Nethereum.Signer
            var signer = new EthereumMessageSigner();
            var addressRecovered = signer.EncodeUTF8AndEcRecover(message, request.Signature);

            if (addressRecovered.ToLower() != request.WalletAddress.ToLower()) return (null, null);

            // Update nonce after successful verification
            user.Nonce = new Random().Next(100000, 999999).ToString();

            // Generate JWT and refresh token
            var token = GenerateJwtToken(user.WalletAddress);
            var refreshToken = GenerateRefreshToken();

            // Update user's refresh token and expiry
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Set expiry to 7 days
            await _context.SaveChangesAsync();

            // Return both tokens
            return (token, refreshToken);
        }

        private string GenerateJwtToken(string walletAddress)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(JwtRegisteredClaimNames.Sub, walletAddress),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        }),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryInMinutes"])),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        public async Task<(string token, string refreshToken)> RefreshTokenAsync(string refreshToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return (null, null);

            // Generate new access and refresh tokens
            var newJwtToken = GenerateJwtToken(user.WalletAddress);
            var newRefreshToken = GenerateRefreshToken();

            // Update the user's refresh token and expiration time in the database
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);  // Extend refresh token expiration
            await _context.SaveChangesAsync();

            return (newJwtToken, newRefreshToken);
        }

        public async Task<User> GetUserByPublicAddressAsync(string publicAddress)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == publicAddress);
        }

        public async Task UpdateUserNonceAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUserKycStatusAsync(string walletAddress, bool isVerified)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);

            if (user != null)
            {
                await _context.SaveChangesAsync();
            }
        }

    }
}
