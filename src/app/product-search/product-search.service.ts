import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AppConfig } from '../services/app.config';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductSearchService {

  constructor(private http: HttpClient) { }

  parseFilter(filter: string) {

  }

  search(filter: string, top: number, skip: number = 0, order: string='PublicationDate', sort: string='desc') {
    // return odata/v1/Products?$count=true with additional optional filters response in JSON Format
    let productsUrl = AppConfig.settings.baseUrl + 'odata/v1/Products?$count=true'
    if(filter && !filter.trim()) {
      productsUrl+='&$filter=' + filter;
    }
    if(top) {
      productsUrl+='&$top=' + top;
    } else {
      productsUrl+='&$top=' + AppConfig.settings.searchOptions.pageSize;
    }
    productsUrl+='&$skip=' + skip + '&$orderby=' + order + ' ' + sort.toLowerCase();
    return this.http.get<any>(
      productsUrl,
      httpOptions
    )
    .pipe(
    catchError(err => {
        console.error(err);
        return throwError(err);
        }
    ));
  }


}
