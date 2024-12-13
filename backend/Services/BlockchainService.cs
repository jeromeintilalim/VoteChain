using System;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexTypes;
using VoteChain.Models;
using VoteChain.Interfaces;

namespace VoteChain.Services
{
    public class BlockchainService : IBlockchainService
    {
        private readonly Web3 _web3;
        private readonly string _contractAddress;
        private readonly string _ownerPrivateKey;
        private readonly string _abi;
        private readonly string _blockchainEndpoint;

        public BlockchainService(IConfiguration configuration)
        {
            // Read values from appsettings.json
            _blockchainEndpoint = configuration["BlockchainSettings:RpcUrl"];
            _contractAddress = configuration["BlockchainSettings:ContractAddress"];
            _ownerPrivateKey = configuration["BlockchainSettings:OwnerPrivateKey"];
            _abi = configuration["BlockchainSettings:Abi"];

            // Initialize the Web3 instance with the account and endpoint
            var account = new Account(_ownerPrivateKey);
            _web3 = new Web3(account, _blockchainEndpoint);
        }


        /// <summary>
        /// Sets the Merkle root for an election in the smart contract.
        /// </summary>
        public async Task<bool> SetMerkleRoot(string electionId, string merkleRoot, string ipfsHash)
        {
            try
            {
                // Load the contract and the function
                var electionMerkleRootFunction = _web3.Eth.GetContract(_abi, _contractAddress)
                    .GetFunction("setMerkleRoot");

                // Convert electionId to BigInteger
                var parsedElectionId = BigInteger.Parse(electionId, System.Globalization.NumberStyles.HexNumber);

                // Estimate gas for the transaction
                var gasEstimate = await electionMerkleRootFunction.EstimateGasAsync(
                    _web3.TransactionManager.Account.Address, // Sender address
                    null, // Gas price (null for default)
                    null, // Value (null for 0 ETH transfer)
                    parsedElectionId, // First function parameter
                    merkleRoot // Second function parameter
                );

                // Create transaction input
                var transactionInput = electionMerkleRootFunction.CreateTransactionInput(
                    _web3.TransactionManager.Account.Address, // From address
                    gas: gasEstimate, // Estimated gas
                    value: null, // No Ether transfer
                    parsedElectionId, // First parameter for setMerkleRoot
                    merkleRoot // Second parameter for setMerkleRoot
                );

                // Send transaction and wait for the receipt
                var transactionReceipt = await _web3.Eth.TransactionManager
                    .SendTransactionAndWaitForReceiptAsync(transactionInput, new CancellationTokenSource().Token);

                // Check transaction status
                if (transactionReceipt.Status.Value == 1)
                {
                    Console.WriteLine($"Merkle root successfully synced on-chain. TxHash: {transactionReceipt.TransactionHash}");
                    return true;
                }
                else
                {
                    Console.WriteLine("Blockchain transaction failed.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting Merkle root: {ex.Message}");
                throw;
            }
        }
    }
}
