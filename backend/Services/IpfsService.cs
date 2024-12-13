using Newtonsoft.Json;
using System.Text;
using VoteChain.Models;

public class IpfsService
{
    private readonly HttpClient _httpClient;

    public IpfsService()
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://api.pinata.cloud/")
        };
        _httpClient.DefaultRequestHeaders.Add("pinata_api_key", "9826d4c8b2fb62b304c5");
        _httpClient.DefaultRequestHeaders.Add("pinata_secret_api_key", "afd64ca513f7e51afb09e3686c93a3b6882b3842016ac9481ce46a360f0055c0");
    }

    public async Task<string> UploadToPinataAsync(object data)
    {
        string jsonData = JsonConvert.SerializeObject(new
        {
            pinataContent = data
        });

        using var content = new StringContent(jsonData, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("pinning/pinJSONToIPFS", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorDetails = await response.Content.ReadAsStringAsync();
            throw new Exception($"Pinata upload failed with status: {response.StatusCode}. Details: {errorDetails}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        dynamic result = JsonConvert.DeserializeObject(jsonResponse);
        return result.IpfsHash ?? throw new InvalidOperationException("IPFS hash not returned in response.");
    }

    public async Task<string> GetFromPinataAsync(string ipfsHash)
    {
        var response = await _httpClient.GetAsync($"https://gateway.pinata.cloud/ipfs/{ipfsHash}");

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to fetch IPFS data. Status: {response.StatusCode}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> UploadElectionDataAsync(string merkleRoot, string voterAddress)
    {
        var data = new
        {
            MerkleRoot = merkleRoot,
            VoterAddress = voterAddress,
            Timestamp = DateTime.UtcNow
        };

        return await UploadToPinataAsync(data);
    }
}
