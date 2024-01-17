import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ICountryData } from '../interfaces/ICountryData';
import { DataApiService } from './data-api.service';
import { HttpClientModule } from '@angular/common/http';

describe('DataApiService', () => {
  let service: DataApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    // Inject the service and the testing controller for HttpTestingController
    service = TestBed.inject(DataApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected data (getAllCountries)', () => {
    const mockData: ICountryData = {
      score: 34,
      selected: true,
      entitled: true,
      dataAvailable: true,
    };

    // Make the HTTP request
    service.getAllCountries().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    // Set up the expectation for the HttpClient mock
    const req = httpMock.expectOne('./assets/data.json');
    expect(req.request.method).toEqual('GET');

    // Respond with the mock data
    req.flush(mockData);
  });

  // Add more test cases as needed
});
