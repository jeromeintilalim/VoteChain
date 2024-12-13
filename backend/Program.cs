using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VoteChain.Data;
using VoteChain.Interfaces;
using VoteChain.Services;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

// Configure CORS
var corsPolicyName = "AllowLocalhost5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IElectionService, ElectionService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IVoteService, VoteService>();
builder.Services.AddScoped<IAccessService, AccessService>();

builder.Services.AddSingleton<IBlockchainService, BlockchainService>();

builder.Services.AddScoped<MerkleTreeService>();
builder.Services.AddScoped<IpfsService>();

builder.Services.AddSingleton<RabbitMQService>();
builder.Services.AddSingleton<RabbitMQVoteConsumer>(); 
//builder.Services.AddScoped<RabbitMQVoteConsumer>();
builder.Services.AddScoped<ApplicationDbContext>();
builder.Services.AddHostedService<RabbitMQConsumerHostedService>();

// Register HttpClient
builder.Services.AddHttpClient();

// Build the app
var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors(corsPolicyName); // Apply CORS before authentication and routing
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

using (var scope = app.Services.CreateScope())
{
    var rabbitMQConsumer = scope.ServiceProvider.GetRequiredService<RabbitMQVoteConsumer>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    var elections = dbContext.Elections.ToList();
    foreach (var election in elections)
    {
        Task.Run(() => rabbitMQConsumer.StartConsuming(election.JoinCode));
    }
}

app.Run();
