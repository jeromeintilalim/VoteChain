namespace VoteChain.Interfaces
{
    public interface IBlockchainService
    {
        Task<bool> SetMerkleRoot(string electionId, string merkleRoot, string ipfsHash);
    }

}
