import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICountryData } from '../interfaces/ICountryData';

@Injectable({
  providedIn: 'root'
})
export class DataApiService {
  
  private readonly _url: string = './assets/data.json';     
  constructor(private readonly _httpClient: HttpClient) {}

  getAllCountries() : Observable<ICountryData> {
    return this._httpClient.get<ICountryData>(this._url);
  }
}
