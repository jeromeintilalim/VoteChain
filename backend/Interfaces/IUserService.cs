using System.Collections.Generic;
using System.Threading.Tasks;
using VoteChain.Models;

namespace VoteChain.Interfaces
{
    public interface IUserService
    {
        Task<bool> RegisterUserAsync(User user);
        //Task<string> AuthenticateUserAsync(LoginRequest request);
        Task<(string token, string refreshToken)> AuthenticateUserAsync(LoginRequest request);
        Task<bool> PerformKycVerificationAsync(KycVerificationRequest request);
        Task<string> GenerateNonceAsync(string walletAddress);
        Task<(string token, string refreshToken)> VerifyNonceAsync(VerifyNonceRequest request);
        Task<User> GetUserByPublicAddressAsync(string publicAddress);
        Task UpdateUserNonceAsync(User user);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task UpdateUserAsync(User user);
        Task<(string token, string refreshToken)> RefreshTokenAsync(string refreshToken);

    }
}
