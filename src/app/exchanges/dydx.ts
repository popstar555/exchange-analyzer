import { HttpClient } from "@angular/common/http";
import { IFundingRate } from "../models/funding-rate";
import { Exchange } from "./base-exchange";
import { catchError, map } from 'rxjs/operators';
import { combineLatest, Observable, of } from "rxjs";

const dYdX_markets=[
  { base: 'ETH', quote: 'DAI' },
  { base: 'ETH', quote: 'USDC' },
  { base: 'DAI', quote: 'USDC' },
  { base: 'BTC', quote: 'USD' },
  { base: 'ETH', quote: 'USD' },
  { base: 'LINK', quote: 'USD' },
];
export class XdYdX extends Exchange{

  constructor(
    httpClient: HttpClient,
    apiKey?: string,
    apiSecret?: string
  ){
    super(httpClient, apiKey, apiSecret);
    this._name = "dYdX";
    this._baseUrl = "https://api.dydx.exchange/v3/";
  }
  
  getFuningRate(): Observable<IFundingRate[]> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() -8 );
    const endTime = new Date();
    const responses:Observable<IFundingRate>[] = [];
    for(let i=0; i<dYdX_markets.length; i++) {
      responses.push(this.getFundingRateBySymbol(dYdX_markets[i].base, dYdX_markets[i].quote));
    }
    return combineLatest(responses)
      .pipe(
        map((data)=> {
          const result:IFundingRate[] = [];
          if(data){
            for(let i=0; i<data.length;i++){
              if(data[i]){
                result.push(data[i]);
              }
            }
          }
          return result;
        }),
        catchError(err => of([]))
      );
  }

  getFundingRateBySymbol(base:string, quote:string):Observable<IFundingRate|null>{
    const pair = `${base}-${quote}`;
    return  this._http.get<IdXdYHistoricalFundingResponse>(this._baseUrl+"historical-funding/"+pair)
    .pipe(
      map(data => {
        if(data && data.historicalFunding && data.historicalFunding.length>0){
          try{
            const result:IFundingRate = {
              symbol: `${this.filterSymbol(base)}${this.filterSymbol(quote)}`,
              rate: data.historicalFunding[0].rate,
            };
            return result;  
          }
          catch(error){
            return null;
          }
        }
        else{
          return null
        }
      }),
      catchError(err => of(null))
    );
  }

  filterSymbol(symbol:string){
    return symbol.replace(/^USD$/gi, 'USDT');
  }
}

interface IdXdYHistoricalFunding{
  market: string;
  rate: number;
  price: number;
  qffectiveAt: Date;
}

interface IdXdYHistoricalFundingResponse{
  historicalFunding:IdXdYHistoricalFunding[]
}