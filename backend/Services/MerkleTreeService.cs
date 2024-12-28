using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using MerkleTools;
using Newtonsoft.Json;
using VoteChain.Models;

public class MerkleTreeService
{
    private MerkleTree _merkleTree;
    private List<byte[]> _leaves; // Storing raw byte hashes for flexibility
    private byte[] _currentRoot; // Current Merkle root

    public MerkleTreeService()
    {
        _merkleTree = new MerkleTree();
        _leaves = new List<byte[]>();
        _currentRoot = null;
    }

    /// <summary>
    /// Initializes the tree with a default empty leaf.
    /// </summary>
    public void InitializeDefaultTree()
    {
        _leaves.Clear(); // Reset leaves
        var defaultLeaf = ComputeHash("{}"); // Representing an empty ballot
        _leaves.Add(defaultLeaf);

        BuildTree();
    }

    /// <summary>
    /// Adds a single vote hash to the Merkle tree and rebuilds it incrementally.
    /// </summary>
    /// <param name="voteJson">Serialized vote data</param>
    public void AddVote(string voteJson)
    {
        if (string.IsNullOrEmpty(voteJson))
            throw new ArgumentException("Vote data cannot be null or empty.");

        var voteHash = ComputeHash(voteJson);
        _leaves.Add(voteHash);

        BuildTree();
    }

    /// <summary>
    /// Builds or rebuilds the Merkle tree using the current leaves.
    /// </summary>
    private void BuildTree()
    {
        _merkleTree = new MerkleTree();

        // Add all leaves to the tree
        foreach (var leaf in _leaves)
        {
            _merkleTree.AddLeaf(leaf, false);
        }

        var buildMethod = _merkleTree.GetType().GetMethod("BuildTree");
        buildMethod?.Invoke(_merkleTree, null);

        // Update the current root
        _currentRoot = _merkleTree.MerkleRootHash;
    }

    /// <summary>
    /// Computes a SHA256 hash for the input string.
    /// </summary>
    /// <param name="input">Input data</param>
    /// <returns>SHA256 hash as a byte array</returns>
    public byte[] ComputeHash(string input)
    {
        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
    }

    /// <summary>
    /// Generates a full Merkle tree for an election based on all ballots.
    /// </summary>
    /// <param name="ballots">List of ballots</param>
    public void GenerateTreeFromBallots(IEnumerable<Ballot> ballots)
    {
        if (ballots == null || !ballots.Any())
            throw new ArgumentException("No ballots provided to generate the tree.");

        _leaves.Clear();

        var settings = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };

        foreach (var ballot in ballots)
        {
            var ballotJson = JsonConvert.SerializeObject(ballot.Votes, settings);
            var ballotHash = ComputeHash(ballotJson);
            _leaves.Add(ballotHash);
        }

        BuildTree();
    }

    /// <summary>
    /// Retrieves the current Merkle root as a hexadecimal string.
    /// </summary>
    /// <returns>Merkle root in hexadecimal format</returns>
    public string GetMerkleRoot()
    {
        if (_currentRoot == null)
        {
            throw new InvalidOperationException("Merkle root is null. Ensure the tree is built correctly.");
        }

        return BitConverter.ToString(_currentRoot).Replace("-", "").ToLower();
    }

    /// <summary>
    /// Generates a Merkle proof for a specific ballot.
    /// </summary>
    /// <param name="ballot">Ballot to generate the proof for</param>
    /// <returns>List of Merkle proof hashes</returns>
    public List<string> GetMerkleProof(Ballot ballot)
    {
        if (ballot == null || ballot.Votes == null || !ballot.Votes.Any())
        {
            throw new ArgumentException("Invalid ballot provided.");
        }

        var leafHash = ComputeHash(JsonConvert.SerializeObject(ballot));
        var proofNodes = _merkleTree.GetProof(leafHash);

        if (proofNodes == null || !proofNodes.Any())
        {
            throw new InvalidOperationException("Proof generation failed. Ensure the ballot exists in the tree.");
        }

        return proofNodes.Select(node => BitConverter.ToString(node.Hash).Replace("-", "").ToLower()).ToList();
    }

    /// <summary>
    /// Generates a Merkle root for an election based on the provided ballots.
    /// </summary>
    /// <param name="ballots">List of ballots</param>
    /// <returns>Merkle root as a hexadecimal string</returns>
    public string GetMerkleRootForElection(IEnumerable<Ballot> ballots)
    {
        GenerateTreeFromBallots(ballots);
        return GetMerkleRoot();
    }
}
