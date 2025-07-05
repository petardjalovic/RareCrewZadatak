using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Configuration;
using System.Net.Http;
using System.Text.Json;
using ZadatakCAPI.EmplyeeService;
using ZadatakCAPI.entities;
using ZadatakCAPI.helpers;
using static ZadatakCAPI.helpers.PiechartCreator;


namespace ZadatakCAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class EmplyeeController : ControllerBase
    {



        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<EmplyeeController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IEmplyeeService _employeeService;
        private readonly string _functionUrl;

        public EmplyeeController(
            IHttpClientFactory httpClientFactory,
            IWebHostEnvironment env,
            ILogger<EmplyeeController> logger,
            IConfiguration configuration,
            IEmplyeeService employeeService)
        {
            _httpClientFactory = httpClientFactory;
            _env = env;
            _logger = logger;
            _configuration = configuration;
            _employeeService = employeeService;
            _functionUrl = _configuration["AzureFunctionUrl"]; // mora postojati u appsettings.json
            var secretClient = new SecretClient(new Uri(_functionUrl), new DefaultAzureCredential());
        }

        [HttpGet("generate-html")]
        public async Task<IActionResult> SaveEmployeeTableHtml()
        {
            try
            {
                var sortedEmployees = await _employeeService.GetSortedEmployeeSummariesAsync(_functionUrl);

                var html = HtmlTableBuilder.BuildEmployeeTable(sortedEmployees);

                var wwwrootPath = _env.WebRootPath;
                var filePath = Path.Combine(wwwrootPath, "employee-table.html");

                await System.IO.File.WriteAllTextAsync(filePath, html);

                return Ok(new { message = "Fajl uspešno sačuvan", path = "/employee-table.html" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Greška prilikom čuvanja HTML fajla");
                return StatusCode(500, $"Greška: {ex.Message}");
            }
        }
        [HttpGet("generate-pie-chart")]
        public async Task<IActionResult> GeneratePieChart()
        {
            try
            {
                // Učitaj podatke
                var sortedEmployees = await _employeeService.GetSortedEmployeeSummariesAsync(_functionUrl);
                if (sortedEmployees == null || sortedEmployees.Count == 0)
                {
                    return BadRequest("Nema podataka za generisanje pie chart-a.");
                }

                // Putanja za čuvanje PNG-a
                var wwwrootPath = _env.WebRootPath;
                var filePath = Path.Combine(wwwrootPath, "pie-chart.png");

                // Generiši pie chart
                PieChartBuilder.BuildPieChart(sortedEmployees, filePath);

                return Ok(new { message = "PNG fajl uspešno sačuvan", path = "/pie-chart.png" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Greška prilikom generisanja PNG pie chart-a");
                return StatusCode(500, $"Greška: {ex.Message}");

            }
        }


    }
}

    
