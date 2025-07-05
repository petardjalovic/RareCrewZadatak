using ZadatakCAPI.dto;
using ZadatakCAPI.entities;

namespace ZadatakCAPI.EmplyeeService
{
    public interface IEmplyeeService
    {
        Task<List<EmployeeSummary>> GetSortedEmployeeSummariesAsync(string functionUrl);
        
    }
}
