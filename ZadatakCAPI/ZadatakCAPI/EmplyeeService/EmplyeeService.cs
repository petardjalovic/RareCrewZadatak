using ScottPlot;
using ScottPlot.Palettes;
using ScottPlot.Plottables;
using System.Text.Json;
using ZadatakCAPI.dto;
using ZadatakCAPI.entities;

namespace ZadatakCAPI.EmplyeeService
{
    public class EmployeeService : IEmplyeeService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<EmployeeService> _logger;

        public EmployeeService(IHttpClientFactory httpClientFactory, ILogger<EmployeeService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<List<EmployeeSummary>> GetSortedEmployeeSummariesAsync(string functionUrl)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync(functionUrl);

                if (!response.IsSuccessStatusCode)
                    throw new Exception("Greška u pozivu Azure Function: " + response.StatusCode);

                var json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var employees = JsonSerializer.Deserialize<List<Employee>>(json, options);

                if (employees == null)
                    throw new Exception("Deserijalizacija nije uspela");

                var groupedEmployees = employees
                    .Where(e => e.DeletedOn == null)
                    .GroupBy(e => e.EmployeeName)
                    .Select(g => new EmployeeSummary
                    {
                        EmployeeId = Guid.NewGuid().ToString(),
                        EmployeeName = g.Key,
                        TotalHoursWorked = g.Sum(e => e.TotalTimeWorked)
                    })
                    .OrderByDescending(x => x.TotalHoursWorked)
                    .ToList();

                return groupedEmployees;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Greška u GetSortedEmployeeSummariesAsync");
                throw;
            }
        }
 

        
    }
}
