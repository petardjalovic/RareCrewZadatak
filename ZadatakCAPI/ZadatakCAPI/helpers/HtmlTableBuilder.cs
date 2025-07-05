using System.Text;
using ZadatakCAPI.dto;
using ZadatakCAPI.entities;

namespace ZadatakCAPI.helpers
{
    public static class HtmlTableBuilder
    {
        public static string BuildEmployeeTable(IEnumerable<EmployeeSummary> employees, double thresholdHours = 100)
        {
            var sb = new StringBuilder();

            sb.AppendLine("<html><head><style>");
            sb.AppendLine("table { border-collapse: collapse; width: 60%; margin: 20px auto; }");
            sb.AppendLine("th, td { border: 1px solid black; padding: 8px; text-align: left; }");
            sb.AppendLine($".low-hours {{ background-color: #ffcccc; }}"); // stil za manje od threshold
            sb.AppendLine("</style></head><body>");
            sb.AppendLine("<h2 style='text-align:center;'>Employee Total Time Worked</h2>");
            sb.AppendLine("<table>");
            sb.AppendLine("<thead><tr><th>Name</th><th>Total Time Worked (hours)</th></tr></thead>");
            sb.AppendLine("<tbody>");

            foreach (var emp in employees)
            {
                var rowClass = emp.TotalHoursWorked < thresholdHours ? "low-hours" : "";
                sb.AppendLine($"<tr class='{rowClass}'><td>{System.Net.WebUtility.HtmlEncode(emp.EmployeeName)}</td><td>{emp.TotalHoursWorked:F2}</td></tr>");
            }

            sb.AppendLine("</tbody></table></body></html>");

            return sb.ToString();
        }
    }
}

