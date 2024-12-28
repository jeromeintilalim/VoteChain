using Microsoft.EntityFrameworkCore;
using VoteChain.Models;

namespace VoteChain.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Election> Elections { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        //public DbSet<Vote> Votes { get; set; }
        public DbSet<ElectionAccess> ElectionAccess { get; set; }
        public DbSet<Nonce> Nonces { get; set; }
        public DbSet<ImageUsage> ImageUsage { get; set; }
        public DbSet<Ballot> Ballots { get; set; }
        public DbSet<VoteEntry> VoteEntries { get; set; }
        public DbSet<MerkleRoot> MerkleRoots { get; set; } // DbSet for Merkle roots
        public DbSet<IpfsFile> IpfsFiles { get; set; } // DbSet for IPFS files
        public DbSet<TransactionQueue> TransactionQueue { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Election Configuration
            modelBuilder.Entity<Election>()
                .ToTable("Elections")
                .HasAnnotation("SqlServer:UseOutputClause", false);

            // ElectionAccess Configuration
            modelBuilder.Entity<ElectionAccess>()
                .HasOne(ea => ea.User)
                .WithMany(u => u.ElectionAccesses)
                .HasForeignKey(ea => ea.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ElectionAccess>()
                .HasOne(ea => ea.Election)
                .WithMany(e => e.ElectionAccesses)
                .HasForeignKey(ea => ea.ElectionId)
                .OnDelete(DeleteBehavior.Cascade);

            // MerkleRoot Configuration
            modelBuilder.Entity<MerkleRoot>()
                .HasOne(m => m.Election)
                .WithMany()
                .HasForeignKey(m => m.ElectionId)
                .OnDelete(DeleteBehavior.Cascade);

            // IpfsFile Configuration
            modelBuilder.Entity<IpfsFile>()
                .Property(i => i.JoinCode)
                .HasMaxLength(50)
                .IsRequired();

            // Add other configurations here as needed
        }


    }
}
