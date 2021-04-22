import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IFundingRate } from "../models/funding-rate";
import { Exchange } from "./base-exchange";
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from "rxjs";

export class XFTX extends Exchange{

  constructor(
    httpClient: HttpClient,
    apiKey?: string,
    apiSecret?: string
  ){
    super(httpClient, apiKey, apiSecret);
    this._name = "FTX";
    this._baseUrl = "https://ftx.com/api/";
  }
  
  getFuningRate(): Observable<IFundingRate[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return  this._http.get<IFTXFundingRateResponse>(this._baseUrl+"funding_rates?limit=120", httpOptions)
    .pipe(
      map(response => {
        const result:IFundingRate[] = [];        
        if(response.success && response.result){
          const data = response.result;
          for(let i=0; i<data.length; i++) {
            const _symbol_arr = data[i].future.split('-');
            if(_symbol_arr[1]==='PERP'){
              try{
                result.push({
                  symbol: _symbol_arr[0]+'USDT',
                  rate: data[i].rate,
                  time: data[i].time
                });  
              }
              catch(error){}
            }

          }
        }
        return result;
      }),
      catchError(err => of([]))
    );
  }
}

interface IFTXFundingRate{
  future: string;
  rate: number;
  time: Date;
}

interface IFTXFundingRateResponse{
  success: boolean,
  result: IFTXFundingRate[],
}