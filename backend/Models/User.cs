using System;
using System.ComponentModel.DataAnnotations;

namespace VoteChain.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        public string BirthDate { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string WalletAddress { get; set; }

        public string? Nonce { get; set; }

        [Required]
        public string UserType { get; set; }

        public ICollection<ElectionAccess>? ElectionAccesses { get; set; }

        public string? RefreshToken { get; set; }

        public DateTime RefreshTokenExpiryTime { get; set; }
    }

    public class TokenRequest
    {
        [Required]
        public string RefreshToken { get; set; }
    }

    public class UserUpdateRequest
    {
        public string Address { get; set; }
        public string Email { get; set; }
    }


    public class LoginRequest
    {
        public string WalletAddress { get; set; }
        public string Signature { get; set; }
    }

    public class VerifyNonceRequest
    {
        public string WalletAddress { get; set; }
        public string Signature { get; set; }
    }

    public class KycVerificationRequest
    {
        [Required]
        public IFormFile IdDocument { get; set; }

        [Required]
        public IFormFile Selfie { get; set; }

        [Required]
        public string WalletAddress { get; set; }
    }
}
