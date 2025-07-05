import { Component ,OnInit } from '@angular/core';
import { AzureDataService } from '../azure-data.service';
import { Observable, of } from 'rxjs';
import { map ,catchError  } from 'rxjs/operators';
import { EmployeeModel } from '../Core/EmplyeeModel';
import { AggregatedEntry } from '../Core/AggregatedEntry';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

 
aggregatedEntries$!: Observable<AggregatedEntry[]>;
  sortAscending: boolean = true;
 
  constructor(private azureDataService: AzureDataService) { }
  
ngOnInit(): void {
   this.aggregatedEntries$ = this.azureDataService.getData().pipe(
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
          const start = entry.startTimeUtc ? new Date(entry.startTimeUtc) : null;
          const end = entry.endTimeUtc ? new Date(entry.endTimeUtc) : null;

          console.log(`Zaposleni: ${entry.employeeName}, Start: ${start}, End: ${end}`);

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

        // 3. Sortiraj rezultate: zaposleni sa < 100 sati (6000 min) na dnu
        result.sort((a, b) => {
          const aBelowThreshold = a.totalMinutes < 6000; // 100 sati = 6000 minuta
          const bBelowThreshold = b.totalMinutes < 6000;

          // Ako je jedan ispod praga, a drugi nije, stavi onog ispod praga na dno
          if (aBelowThreshold && !bBelowThreshold) return 1;
          if (!aBelowThreshold && bBelowThreshold) return -1;

          // Ako su oba ispod ili iznad praga, sortiraj po imenu
          const nameA = a.employeeName.toLowerCase();
          const nameB = b.employeeName.toLowerCase();
          return this.sortAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });

        console.log('Aggregirani rezultati:', result);
        return result;
      }),
      catchError(error => {
        console.error('Greška u dohvatanju podataka:', error);
        return of([]);
      })
    );
  }

  formatDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
  }


}


  











