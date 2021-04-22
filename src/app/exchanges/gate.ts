import { HttpClient } from "@angular/common/http";
import { IFundingRate } from "../models/funding-rate";
import { Exchange } from "./base-exchange";
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from "rxjs";

export class XGate extends Exchange{

  constructor(
    httpClient: HttpClient,
    apiKey?: string,
    apiSecret?: string
  ){
    super(httpClient, apiKey, apiSecret);
    this._name = "Gate";
    this._baseUrl = "https://fx-api.gateio.ws/api/v4/";
  }
  
  getFuningRate(): Observable<IFundingRate[]> {
    return  this._http.get<IGateContract[]>(this._baseUrl+"futures/usdt/contracts")
    .pipe(
      map(data => {
        const result:IFundingRate[] = [];
        if(data){
          for(let i=0; i<data.length; i++) {
            result.push({
              symbol: data[i].name.replace(/_/gi, ''),
              rate: data[i].funding_rate,
            });
          }
        }
        return result;
      }),
      catchError(err => of([]))
    );
  }
}

interface IGateContract{
  name: string;
  funding_rate: number;
}