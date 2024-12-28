using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Security.Cryptography;
using System.Text;
using VoteChain.Data;
using VoteChain.Interfaces;
using VoteChain.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client.Exceptions;

namespace VoteChain.Services
{
    public class RabbitMQVoteConsumer
    {
        private readonly IServiceProvider _serviceProvider;

        public RabbitMQVoteConsumer(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public void StartConsuming(string joinCode)
        {
            ConnectionFactory factory = new ConnectionFactory
            {
                HostName = "127.0.0.1",
                UserName = "scatter",
                Password = "password001",
                VirtualHost = "/",
                Port = 5672,
                AutomaticRecoveryEnabled = true,
                RequestedConnectionTimeout = TimeSpan.FromSeconds(30),
                DispatchConsumersAsync = true,
                ClientProvidedName = "VoteChainConsumer",
                RequestedHeartbeat = TimeSpan.FromSeconds(30)
            };

            try
            {
                IConnection connection = factory.CreateConnection();
                var channel = connection.CreateModel();
                Console.WriteLine("Connection established successfully!");

                var queueName = $"votes_queue_{joinCode}";
                channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false);

                var consumer = new AsyncEventingBasicConsumer(channel);
                consumer.Received += async (model, ea) =>
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);

                    Console.WriteLine($"Raw message received: {message}");

                    try
                    {
                        var ballot = JsonConvert.DeserializeObject<Ballot>(message);

                        Console.WriteLine($"1. Ballot = {ballot}");
                        if (ballot != null)
                        {
                            Console.WriteLine($"2. Ballot = {ballot}");
                            using var scope = _serviceProvider.CreateScope();
                            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                            var merkleService = scope.ServiceProvider.GetRequiredService<MerkleTreeService>();
                            var blockchainService = scope.ServiceProvider.GetRequiredService<IBlockchainService>();

                            Console.WriteLine($"umabot dito bago mag ProcessVote");
                            await ProcessVote(ballot, dbContext, merkleService, blockchainService);
                        }

                        channel.BasicAck(ea.DeliveryTag, false);  // Acknowledge message
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing vote: {ex.Message}");
                        Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                        channel.BasicNack(ea.DeliveryTag, false, false);  // Do not requeue the message
                    }
                };

                channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
            }
            catch (BrokerUnreachableException ex)
            {
                Console.WriteLine($"BrokerUnreachableException: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected Error: {ex.Message}");
            }
        }

        private async Task ProcessVote(Ballot ballot, ApplicationDbContext context, MerkleTreeService merkleTreeService, IBlockchainService blockchainService)
        {
            Console.WriteLine($"umabot dito sa ProcessVote");

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.WalletAddress == ballot.VoterAddress);

            if (user == null)
            {
                throw new InvalidOperationException($"No user found for wallet address {ballot.VoterAddress}");
            }

            // Set the UserId in the ballot
            ballot.UserId = user.UserId;

            Console.WriteLine($"umabot dito bago mag context.Ballots.Add");

            // Save the Ballot
            context.Ballots.Add(ballot);
            await context.SaveChangesAsync();

            Console.WriteLine($"umabot dito bago mag merkleTreeService.AddVote");

            // Update Merkle tree
            merkleTreeService.AddVote(JsonConvert.SerializeObject(ballot, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore // Fix self-referencing loop issue
            }));

            var merkleRoot = merkleTreeService.GetMerkleRoot();

            Console.WriteLine($"umabot dito bago mag transactionQueue");

            // Create transaction queue entry
            var transactionQueue = new TransactionQueue
            {
                JoinCode = ballot.JoinCode,
                ElectionId = GenerateElectionId(ballot.JoinCode),
                MerkleRoot = merkleRoot,
                VoterAddress = ballot.VoterAddress,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            Console.WriteLine($"umabot dito bago mag context.TransactionQueue.Add");
            context.TransactionQueue.Add(transactionQueue);
            await context.SaveChangesAsync();

            Console.WriteLine($"TransactionQueue entry added successfully for JoinCode: {ballot.JoinCode}");
        }

        private string GenerateElectionId(string joinCode)
        {
            using var sha256 = SHA256.Create();
            return BitConverter.ToString(sha256.ComputeHash(Encoding.UTF8.GetBytes(joinCode))).Replace("-", "").ToLower();
        }
    }
}
