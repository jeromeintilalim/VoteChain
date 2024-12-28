using VoteChain.Data;

namespace VoteChain.Services
{
    public class RabbitMQConsumerHostedService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public RabbitMQConsumerHostedService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var rabbitMQConsumer = scope.ServiceProvider.GetRequiredService<RabbitMQVoteConsumer>();

            var elections = dbContext.Elections.ToList();
            foreach (var election in elections)
            {
                Task.Run(() => rabbitMQConsumer.StartConsuming(election.JoinCode), stoppingToken);
            }

            await Task.CompletedTask; // Keep the service running
        }
    }

}
