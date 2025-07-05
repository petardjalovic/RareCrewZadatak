
import { Component, OnInit,OnDestroy } from '@angular/core';
import { AzureDataService } from '../azure-data.service';
import { Observable, of ,Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EmployeeModel } from '../Core/EmplyeeModel';
import { AggregatedEntry } from '../Core/AggregatedEntry';
import { ChartConfiguration } from 'chart.js';
@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.css']
})
export class PieChartComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  aggregatedEntries: AggregatedEntry[] = []; // Za čuvanje podataka

  // Pie chart podaci
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 20
    }]
  };
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const hours = Math.floor(value / 60);
            const minutes = value % 60;
            return `${label}: ${hours}h ${minutes}min`;
          }
        }
      }
    }
  };
  public pieChartType: ChartConfiguration<'pie'>['type'] = 'pie';

  constructor(private azureDataService: AzureDataService) {}

  ngOnInit(): void {
    this.subscription = this.azureDataService.getData().pipe(
      // 1. Mapiraj polja iz API-ja u camelCase i proveri null/undefined
      map((entries: any[]) => {
        console.log('Sirovi podaci iz API-ja:', entries);
        if (!entries) {
          console.warn('API je vratio null ili undefined podatke');
          return [] as EmployeeModel[];
        }

        return entries
          .map((entry): EmployeeModel | null => {
            if (!entry || entry.Id == null) {
              console.warn('Preskočen nevalidan unos zbog nedostajućeg Id:', entry);
              return null;
            }

            return {
              id: entry.Id,
              employeeName: entry.EmployeeName ?? 'undefined',
              startTimeUtc: entry.StarTimeUtc ?? null,
              endTimeUtc: entry.EndTimeUtc ?? null,
              entryNotes: entry.EntryNotes ?? 'undefined',
              deletedOn: entry.DeletedOn ?? null
            } as EmployeeModel;
          })
          .filter((entry): entry is EmployeeModel => entry !== null);
      }),
      // 2. Preračunaj ukupno vreme rada po zaposlenom
      map((entries: EmployeeModel[]) => {
        console.log('Mapirani podaci:', entries);

        const aggregationMap = new Map<string, number>();

        for (const entry of entries) {
          console.log(`Raw start time: ${entry.startTimeUtc}, Raw end time: ${entry.endTimeUtc}`);
          const start = entry.startTimeUtc ? new Date(entry.startTimeUtc) : null;
          const end = entry.endTimeUtc ? new Date(entry.endTimeUtc) : null;
          console.log(`Parsed start: ${start}, Parsed end: ${end}`);

          if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() >= start.getTime()) {
            const durationMs = end.getTime() - start.getTime();
            const durationMin = Math.floor(durationMs / (1000 * 60));
            const currentTotal = aggregationMap.get(entry.employeeName) || 0;
            aggregationMap.set(entry.employeeName, currentTotal + durationMin);
            console.log(`Dodato ${durationMin} min za ${entry.employeeName}`);
          } else {
            if (!aggregationMap.has(entry.employeeName)) {
              aggregationMap.set(entry.employeeName, 0);
            }
            console.warn(`Nevalidni datumi za ${entry.employeeName}:`, entry);
          }
        }

        const result: AggregatedEntry[] = Array.from(aggregationMap.entries()).map(([name, minutes]) => ({
          employeeName: name,
          totalMinutes: minutes
        }));

        // 3. Pripremi podatke za pie chart
        this.pieChartData = {
          labels: result.map(entry => entry.employeeName),
          datasets: [{
            data: result.map(entry => entry.totalMinutes),
            backgroundColor: result.map(entry =>
              entry.totalMinutes < 6000 ? '#FF0000' : // Crvena za < 100 sati
              ['#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][result.indexOf(entry) % 5]
            ),
            hoverOffset: 20
          }]
        };

        console.log('Pie chart podaci:', this.pieChartData);
        return result;
      }),
      catchError(error => {
        console.error('Greška u dohvatanju podataka:', error);
        return of([]);
      })
    ).subscribe(data => {
      this.aggregatedEntries = data; // Čuvamo podatke za potencijalnu upotrebu
      console.log('Pretplata na aggregatedEntries:', data);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Otkaži pretplatu da izbegneš curenje memorije
  }
}

