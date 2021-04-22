import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IFundingRate } from "../models/funding-rate";
import { Exchange } from "./base-exchange";
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from "rxjs";

export class XHuobi extends Exchange{

  constructor(
    httpClient: HttpClient,
    apiKey?: string,
    apiSecret?: string
  ){
    super(httpClient, apiKey, apiSecret);
    this._name = "Huobi";
    this._baseUrl = "https://api.hbdm.com/linear-swap-api/v1/";
  }
  
  getFuningRate(): Observable<IFundingRate[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return  this._http.get<IBinanceFundingRateResponse>(this._baseUrl+"swap_batch_funding_rate", httpOptions)
    .pipe(
      map(response => {
        const result:IFundingRate[] = [];
        if(response && response.data){
          const data = response.data;
          for(let i=0; i<data.length; i++) {
            result.push({
              symbol: `${data[i].symbol}${data[i].fee_asset}`,
              rate: data[i].funding_rate,
              time: data[i].funding_time,
            });
          }
        }
        return result;
      }),
      catchError(err => of([])),
    );
  }
}

interface IBinanceFundingRate{
  estimated_rate: number;
  funding_rate: number;
  contract_code: string; //ETC-USDT,
  symbol: string; //ETC,
  fee_asset: string; //USDT,
  funding_time: Date;
  next_funding_time: Date;
}

interface IBinanceFundingRateResponse{
  data: IBinanceFundingRate[],
  status: string,
  ts: Date,
}