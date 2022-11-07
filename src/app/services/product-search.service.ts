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

  parseFilter(str: string) {
    console.log('initial filter', str);
    let filterArray: any =[];
    const regexContains = /\*(.*)\*/gm;
    const regexStartsWith = /[^;]+\*(?=$|;)/gm;
    const regexEndsWith = /^\*(.*)/gm;

    let filterPortions=str.split(' ');

    let processedString='';
    try {

      filterPortions.forEach(function (portion) {
        if(regexContains.test(portion)) {
          filterArray.push(`contains(Name, '${portion.replace(/\*/g,'')}')`);
        } else if (regexEndsWith.test(portion)) {
          filterArray.push(`endswith(Name, '${portion.replace(/\*/g,'')}')`);
        } else if (regexStartsWith.test(portion)) {
          filterArray.push(`startswith(Name, '${portion.replace(/\*/g,'')}')`);
        } else {
          filterArray.push(portion);
        }
      });
      processedString = filterArray.join(' ');
      console.log('final replacement', processedString);

    } catch (error) {
      console.error("Error converting Filter!");
      console.error(error);
    }
    return processedString;
  }

  /*
   search(searchOptions: any) is used to trigger the odata/v1/Products request
   searchOptions = {
    filter: string (OData filter syntax),
    top: number,
    skip: number,
    order: string (must be a Products entity Property),
    sort: string (asc|desc)
   }
  */
  //search(filter: string, top: number, skip: number = 0, order: string='PublicationDate', sort: string='desc') {
  search(searchOptions: any) {
    // return odata/v1/Products?$count=true with additional optional filters response in JSON Format
    let order = 'PublicationDate';
    let sort = 'desc';
    let skip = 0;
    let productsUrl = AppConfig.settings.baseUrl + 'odata/v1/Products?$count=true';
    if(searchOptions && searchOptions.filter && searchOptions.filter.trim()) {
      productsUrl+='&$filter=' + this.parseFilter(searchOptions.filter);
    }
    if(searchOptions && searchOptions.top) {
      productsUrl+='&$top=' + searchOptions.top;
    } else {
      productsUrl+='&$top=' + AppConfig.settings.searchOptions.pageSize;
    }
    if(searchOptions && searchOptions.skip ) {
      skip = searchOptions.skip;
    }
    if(searchOptions && searchOptions.order ) {
      order = searchOptions.order;
    }
    if(searchOptions && searchOptions.sort ) {
      sort = searchOptions.sort;
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

  /* getQL(uuid: string) is used to check if there is a quicklook for that product id */
  getQL(uuid: string) {
    let uuidURL = AppConfig.settings.quicklookURL.replace('<base_url>', AppConfig.settings.baseUrl_).replace('<uuid>', uuid);
    console.log(uuidURL);

    return this.http.get<any>(
      uuidURL,
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
