import { HttpClient } from "@angular/common/http";
import { IFundingRate } from "../models/funding-rate";
import { Exchange } from "./base-exchange";
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from "rxjs";

export class XKraken extends Exchange{

  constructor(
    httpClient: HttpClient,
    apiKey?: string,
    apiSecret?: string
  ){
    super(httpClient, apiKey, apiSecret);
    this._name = "Kraken";
    this._baseUrl = "https://futures.kraken.com/derivatives/api/v3/";
  }
  
  getFuningRate(): Observable<IFundingRate[]> {
    return  this._http.get<IKrakenTickersResponse>(this._baseUrl+"tickers")
    .pipe(
      map(resp => {
        const result:IFundingRate[] = [];
        if(resp.result==='success'){
          const data = resp.tickers;
          for(let i=0; i<data.length; i++) {
            if(data[i].tag==='perpetual' && data[i].pair!==undefined 
              && data[i].fundingRate!==undefined){
              const _symbol_arr = data[i].pair.split(':');
              const base = this.filterSymbol(_symbol_arr[0]);
              const quote = this.filterSymbol(_symbol_arr[1]);
              result.push({
                symbol: `${base}${quote}`,
                rate: data[i].fundingRate,
                time: data[i].lastTime?data[i].lastTime:new Date(),
              });
            }
          }
        }
        return result;
      }),
      catchError(err => of([]))
    );
  }

  filterSymbol(pair:string){
    return pair.replace(/^XBT$/, "BTC")
               .replace(/^USD$/, "USDT")
  }
}

interface IKrakenTicker{
  tag?: string; //perpetual,
  pair?: string; //XBT:USD,
  symbol: string; //pi_xbtusd,
  markPrice?: number; //54460.2,
  bid?: number; //54458.5,
  bidSize?: number; //2040,
  ask?: number; //54469.5,
  askSize?: number; //9607,
  vol24h?: number; //527746061,
  openInterest?: number; //170699079,
  open24h?: number; //56870.5,
  last: number; //54437.5,
  lastTime: Date; //2021-04-20T06:38:57.633Z,
  lastSize?: number; //200,
  suspended?: boolean; //false,
  fundingRate?: number; //-0.000000000820991526,
  fundingRatePrediction?: number; //0.000000000518370697
}

interface IKrakenTickersResponse{
  result: string;
  tickers: IKrakenTicker[];
  serverTime?: Date;
}