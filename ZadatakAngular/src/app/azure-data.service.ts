import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeModel } from './Core/EmplyeeModel';
import { AggregatedEntry } from './Core/AggregatedEntry';


@Injectable({
  providedIn: 'root'
})
export class AzureDataService {
  private apiUrl = 'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';


  constructor(private http: HttpClient) { }

 getData(): Observable<EmployeeModel[]> {
  return this.http.get<EmployeeModel[]>(this.apiUrl);


}
}
