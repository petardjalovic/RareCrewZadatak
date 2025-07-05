using SkiaSharp;
using ZadatakCAPI.dto;

namespace ZadatakCAPI.helpers
{
    public class PiechartCreator
    {
        public class PieChartBuilder
        {
           
                 public static void BuildPieChart(List<EmployeeSummary> data, string outputPath, int width = 600, int height = 400)
            {
                // Proveri da li su podaci validni
                if (data == null || data.Count == 0)
                {
                    throw new ArgumentException("Podaci za pie chart ne smeju biti null ili prazni.");
                }

                // Kreiraj površinu za crtanje
                using var surface = SKSurface.Create(new SKImageInfo(width, height));
                var canvas = surface.Canvas;

                // Postavi pozadinu (bela)
                canvas.Clear(SKColors.White);

                // Definiši centar i poluprečnik pie chart-a
                float centerX = width / 2f;
                float centerY = height / 2f;
                float radius = Math.Min(width, height) / 2.5f;

                // Definiši boje za segmente
                SKColor[] colors = new SKColor[]
                {
                SKColors.Red,
                SKColors.Blue,
                SKColors.Yellow,
                SKColors.Green,
                SKColors.Purple,
                SKColors.Orange
                };

                // Izračunaj ukupnu vrednost za procentualni raspored
                double totalValue = 0;
                foreach (var item in data)
                {
                    totalValue += item.TotalHoursWorked;
                }

                if (totalValue <= 0)
                {
                    throw new ArgumentException("Ukupna vrednost TotalHoursWorked mora biti veća od nule.");
                }

                // Počni sa uglom od 0
                float startAngle = 0;

                // Crtaj segmente pie chart-a
                using var paint = new SKPaint { IsAntialias = true };
                for (int i = 0; i < data.Count; i++)
                {
                    float sweepAngle = (float)(data[i].TotalHoursWorked / totalValue * 360f);
                    paint.Color = colors[i % colors.Length]; // Rotiraj boje ako ih ima više

                    // Crtaj segment
                    using var path = new SKPath();
                    path.MoveTo(centerX, centerY);
                    path.ArcTo(new SKRect(centerX - radius, centerY - radius, centerX + radius, centerY + radius),
                               startAngle, sweepAngle, false);
                    path.Close();
                    canvas.DrawPath(path, paint);

                    // Dodaj tekst za EmployeeName, zamenjujući null ili prazan string sa "Nepoznato"
                    string label = string.IsNullOrWhiteSpace(data[i].EmployeeName) ? $"Nepoznato {i + 1}" : data[i].EmployeeName;
                    using var textPaint = new SKPaint
                    {
                        Color = SKColors.Black,
                        TextSize = 14,
                        IsAntialias = true
                    };
                    float textAngle = startAngle + sweepAngle / 2;
                    float textX = centerX + (float)(radius * 0.7 * Math.Cos(textAngle * Math.PI / 180));
                    float textY = centerY + (float)(radius * 0.7 * Math.Sin(textAngle * Math.PI / 180));
                    canvas.DrawText(label, textX, textY, textPaint);

                    startAngle += sweepAngle;
                }

                // Sačuvaj sliku kao PNG
                using var image = surface.Snapshot();
                using var dataStream = image.Encode(SKEncodedImageFormat.Png, 100);
                using var fileStream = File.OpenWrite(outputPath);
                dataStream.SaveTo(fileStream);




            }


        }
    }
}

