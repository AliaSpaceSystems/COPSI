import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, Observable, of, throwError } from 'rxjs';
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

  getProductsCount(url:string) {
    return this.http.get<any>(
      url,
      httpOptions
    )
  }

  getProducts(url:string) {
    return this.http.get<any>(
      url,
      httpOptions
    )
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
    let productsCountUrl = AppConfig.settings.baseUrl + 'odata/v1/Products?$count=true&$top=1';
    let productsUrl = AppConfig.settings.baseUrl + 'odata/v1/Products?$expand=Attributes';
    //The option $count=true requires only the $filter parameter. No $orderby or $skip is needed for the count.
    //The $top is fixed to 1 
    let checkWildcard = (searchOptions && searchOptions.filter) ? searchOptions.filter.replace(/\*/g, '') : '';
    if(searchOptions && searchOptions.filter && searchOptions.filter.trim() && checkWildcard) {
      productsUrl+='&$filter=' + this.parseFilter(searchOptions.filter);
      productsCountUrl+='&$filter=' + this.parseFilter(searchOptions.filter);
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
    return forkJoin({
      count: this.getProductsCount(productsCountUrl).pipe(map((res) => res), catchError(e => of(e))),
      products: this.getProducts(productsUrl).pipe(map((res) => res), catchError(e => of(e)))
    })
    .pipe(
      map((response: { count: object; products: object }) => {
        const count: any = response.count;
        const products: any = response.products;
        let result: any = products;
        if (!result.hasOwnProperty('@odata.count')) {
          result['@odata.count'] = count['@odata.count'];
        }
        
        return(result);
      })
    )
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

  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }
}
