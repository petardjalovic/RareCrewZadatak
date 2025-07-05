import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TableComponent } from './table/table.component';
import { PieChartComponent } from './piechart/piechart.component';
import { AzureDataService } from './azure-data.service';
import { bootstrapApplication } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TableComponent,
    PieChartComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgChartsModule
     

  ],
  providers: [AzureDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
