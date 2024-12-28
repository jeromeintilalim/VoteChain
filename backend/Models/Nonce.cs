using System;
using System.ComponentModel.DataAnnotations;

namespace VoteChain.Models
{
    public class Nonce
    {
        [Key]
        public int NonceId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Value { get; set; }

        [Required]
        public DateTime Expiration { get; set; }
    }
}
