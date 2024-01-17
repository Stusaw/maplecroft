import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { event as d3Event } from 'd3-selection';
import * as R from 'ramda';
import { Subject } from 'rxjs';
import { ICountryData } from '../interfaces/ICountryData';
import { IGeoFeature } from '../interfaces/IGeoFeature';

@Injectable({
  providedIn: 'root',
})
export class GlobeService {
  private _countryData: ICountryData;
  private _countryDetailsSource: Subject<any> = new Subject<any>();

  public countryDetails$ = this._countryDetailsSource.asObservable();

  public loadGlobe(countryData: ICountryData) {
    this._countryData = countryData;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sensitivity = 75;

    const projection = d3
      .geoOrthographic()
      .scale(400)
      .center([0, 0])
      .rotate([0, -30])
      .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    let path = d3.geoPath().projection(projection);

    const svg = d3
      .select('#globe')
      .append('svg')
      .attr('width', width - 20)
      .attr('height', height - 20);

    const globe = svg
      .append('circle')
      .attr('fill', '#ADD8E6')
      .attr('stroke', '#000')
      .attr('stroke-width', '0.2')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', initialScale);

    svg
      .call(
        d3.drag().on('drag', () => {
          const rotate = projection.rotate();
          const k = sensitivity / projection.scale();
          projection.rotate([
            rotate[0] + d3Event.dx * k,
            rotate[1] - d3Event.dy * k,
          ]);
          path = d3.geoPath().projection(projection);
          svg.selectAll('path').attr('d', path);
        })
      )
      .call(
        d3.zoom().on('zoom', () => {
          if (d3Event.transform.k > 0.3) {
            projection.scale(initialScale * d3Event.transform.k);
            path = d3.geoPath().projection(projection);
            svg.selectAll('path').attr('d', path);
            globe.attr('r', projection.scale());
          } else {
            d3Event.transform.k = 0.3;
          }
        })
      );

    const map = svg.append('g');

    d3.json('assets/ne_110m_admin_0_countries.json', (err, d) => {
      map
        .append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(d.features)
        .enter()
        .append('path')
        .attr('class', (d: IGeoFeature) => 'country_' + d.properties.ISO_A2)
        .attr('d', path)
        .attr('fill', (d: IGeoFeature) => this.getEntitledCountriesOnly(d))
        .style('stroke', 'black')
        .style('stroke-width', 0.3)
        .on('mouseleave', (d: IGeoFeature) => this.clearDetails())
        .on('mouseover', (d: IGeoFeature) =>
          this.getCountryDetails(d.properties.ISO_A2, d.properties.NAME)
        );
    });
  }

  private getEntitledCountriesOnly(d: IGeoFeature): string {
    const mergedObject = {
      ...d,
      properties: {
        ...d.properties,
        ...this._countryData[d.properties.ISO_A2],
      },
    };

    // Function to filter based on a nested property
    const filterByNestedProperty = (path, value, obj) =>
      R.filter(R.pathEq(path, value), obj);
    const filteredData = filterByNestedProperty(
      ['entitled'],
      true,
      mergedObject
    );
    console.log(filteredData);

    const scoreColour = this.getScoreColour(
      this.getCountryScore(filteredData.properties?.ISO_A2)
    );
    return scoreColour;
  }

  private getScoreColour(score: number | null, defaultColor = 'LightGray') {
    if (R.isNil(score) || Number.isNaN(score) || score > 10) {
      return defaultColor;
    }
    if (score <= 2.5) {
      return '#ce181f';
    }
    if (score <= 5) {
      return '#f47721';
    }
    if (score <= 7.5) {
      return '#ffc709';
    }
    return '#d6e040';
  }

  private getCountryScore(countryCode: string): number | undefined {
    const country = this._countryData[countryCode];
    return country ? country.score : undefined;
  }

  private clearDetails() {
    this._countryDetailsSource.next(undefined);
  }

  private getCountryDetails(countryCode: string, countryName: string): string {
    const country = this._countryData[countryCode];
    if (!country) {
      this._countryDetailsSource.next(null);
    }
    let countryDetails: string = `${countryName}: ${country?.score?.toFixed(2)}`;
    this._countryDetailsSource.next(countryDetails);
    return countryDetails;
  }
}
