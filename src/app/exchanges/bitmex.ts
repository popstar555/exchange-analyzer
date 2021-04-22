import { HttpClient } from "@angular/common/http";
import { IFundingRate } from "../models/funding-rate";
import { Exchange } from "./base-exchange";
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from "rxjs";

export class XBitmex extends Exchange{

  constructor(
    httpClient: HttpClient,
    apiKey?: string,
    apiSecret?: string
  ){
    super(httpClient, apiKey, apiSecret);
    this._name = "Bitmex";
    this._baseUrl = "https://www.bitmex.com/api/v1/";
  }
  
  getFuningRate(): Observable<IFundingRate[]> {
    return  this._http.get<IBitmexFundingRate[]>(this._baseUrl+"funding?count=200&start=0&reverse=true")
    .pipe(
      map(data => {
        const result:IFundingRate[] = [];
        if(data){
          for(let i=0; i<data.length; i++) {
            result.push({
              symbol: this.filterSymbol(data[i].symbol),
              rate: data[i].fundingRate,
              time: data[i].timestamp,
            });
          }
        }
        return result;
      }),
      catchError(err => of([]))
    );
  }

  filterSymbol(symbol:string){
    return symbol
            .replace(/^XBT/gi, 'BTC')
            .replace(/XBT$/gi, 'BTC');
  }
}

interface IBitmexFundingRate{
  timestamp: Date;
  symbol: string;
  fundingInterval: Date;
  fundingRate: number;
  fundingRateDaily: number;
}