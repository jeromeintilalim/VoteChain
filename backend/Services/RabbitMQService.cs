using Newtonsoft.Json;
using RabbitMQ.Client;
using System.Text;
using VoteChain.Models;

namespace VoteChain.Services
{
    public class RabbitMQService
    {
        private readonly IConnection _connection;

        public RabbitMQService()
        {
            ConnectionFactory factory = new ConnectionFactory
            {
                // "guest"/"guest" by default, limited to localhost connections
                HostName = "127.0.0.1",
                UserName = "scatter",
                Password = "password001",
                VirtualHost = "/",
                Port = 5672,  // Explicitly specify the AMQP port
                AutomaticRecoveryEnabled = true,  // Enable automatic recovery
                RequestedConnectionTimeout = TimeSpan.FromSeconds(30),  // Increase timeout
                DispatchConsumersAsync = true,  // Required for async consumers
                ClientProvidedName = "VoteChainConsumer",  // Optional for easier debugging
                RequestedHeartbeat = TimeSpan.FromSeconds(30)  // 30-second heartbeat
            };
            _connection = factory.CreateConnection();
        }

        /// <summary>
        /// Enqueues a vote into the RabbitMQ queue for the election.
        /// </summary>
        /// <param name="ballot">Ballot to enqueue</param>
        public async Task EnqueueVoteAsync(Ballot ballot)
        {
            var queueName = $"votes_queue_{ballot.JoinCode}";
            using var channel = _connection.CreateModel();
            channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false);

            var message = JsonConvert.SerializeObject(ballot);
            var body = Encoding.UTF8.GetBytes(message);
                
            channel.BasicPublish(exchange: "", routingKey: queueName, body: body);
        }
    }
}
