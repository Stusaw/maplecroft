import { Component, OnInit } from '@angular/core';

import { DataApiService } from './services/data-api.service';
import { ICountryData } from './interfaces/ICountryData';
import { GlobeService } from './services/globe.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'globe-demo';

  public countryDetails$: Observable<string | undefined>;

  constructor(
    private readonly _dataService: DataApiService,
    private readonly _globeService: GlobeService
  ) {}

  ngOnInit(): void {
    this.configure();
  }

  configure() {
    this._dataService
      .getAllCountries()
      .subscribe((countryData: ICountryData) => {
        this._globeService.loadGlobe(countryData);
        this.countryDetails$ = this._globeService.countryDetails$;
      });
  }
}
