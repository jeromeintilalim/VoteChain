using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using VoteChain.Data;
using Microsoft.EntityFrameworkCore;
using VoteChain.Models;
using VoteChain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace VoteChain.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly ApplicationDbContext _context;

        public CandidateService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddCandidateAsync(Candidate candidate, IFormFile? image)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Validate PositionId
                    var positionExists = await _context.Positions.AnyAsync(p => p.PositionId == candidate.PositionId);
                    if (!positionExists)
                    {
                        throw new Exception($"Position with ID {candidate.PositionId} does not exist.");
                    }

                    // Handle image upload or set to placeholder
                    if (image != null && image.Length > 0)
                    {
                        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}";
                        var directoryPath = Path.Combine("wwwroot", "images");

                        if (!Directory.Exists(directoryPath))
                        {
                            Directory.CreateDirectory(directoryPath);
                        }

                        var imagePath = Path.Combine(directoryPath, uniqueFileName);

                        using (var stream = new FileStream(imagePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        candidate.ImageUrl = $"/images/{uniqueFileName}";
                    }
                    else
                    {
                        // Set the placeholder image if no image is uploaded
                        candidate.ImageUrl = "/images/placeholder-votechain-0xbiogesic.png";
                    }

                    _context.Candidates.Add(candidate);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return false;
                }
            }
        }

        public async Task<bool> UpdateCandidateAsync(Candidate candidate, IFormFile? image, bool removeImage)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Fetch the existing candidate from the database
                    var existingCandidate = await _context.Candidates.FindAsync(candidate.CandidateId);
                    if (existingCandidate == null)
                    {
                        throw new Exception($"Candidate with ID {candidate.CandidateId} does not exist.");
                    }

                    // Handle the image logic
                    if (removeImage)
                    {
                        // Set the image to a placeholder if the user wants to remove the image
                        existingCandidate.ImageUrl = "/images/placeholder-votechain-0xbiogesic.png";
                    }
                    else if (image != null && image.Length > 0)
                    {
                        // Replace the current image with a new one if a new image is provided
                        var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
                        var directoryPath = Path.Combine("wwwroot", "images");

                        if (!Directory.Exists(directoryPath))
                        {
                            Directory.CreateDirectory(directoryPath);
                        }

                        var imagePath = Path.Combine(directoryPath, uniqueFileName);
                        using (var stream = new FileStream(imagePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        existingCandidate.ImageUrl = $"/images/{uniqueFileName}";
                    }
                    // If no new image is uploaded and the removeImage flag is not set, retain the existing image.
                    // No changes to the imageUrl property

                    // Update the non-image fields
                    existingCandidate.Name = candidate.Name;
                    existingCandidate.Details = candidate.Details;

                    // Save changes to the database
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return false;
                }
            }
        }


        public async Task<bool> DeleteCandidateAsync(int candidateId)
        {
            var candidate = await _context.Candidates.FindAsync(candidateId);
            if (candidate == null)
                return false;

            var imageUsage = await _context.ImageUsage.FirstOrDefaultAsync(i => i.FileName == candidate.ImageUrl);
            if (imageUsage != null)
            {
                imageUsage.UsageCount--;
                if (imageUsage.UsageCount <= 0)
                {
                    var filePath = Path.Combine("wwwroot", candidate.ImageUrl.TrimStart('/'));
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                    _context.ImageUsage.Remove(imageUsage);
                }
            }

            _context.Candidates.Remove(candidate);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<Candidate>> GetCandidatesAsync(int positionId)
        {
            return await _context.Candidates.Where(c => c.PositionId == positionId).ToListAsync();
        }

        public async Task<Candidate> GetCandidateByIdAsync(int candidateId)
        {
            return await _context.Candidates.FindAsync(candidateId);
        }
    }
}
