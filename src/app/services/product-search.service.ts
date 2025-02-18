import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { AppConfig } from '../services/app.config';
import { download, Download } from 'ngx-operators';
import { saveAs } from 'file-saver';

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
    //console.log('initial filter: ', str);
    let filterArray: any = [];
    const regexContains = /^\*(.*)\*/;
    const regexStartsWith = /[^;]+\*(?=$|;)/;
    const regexEndsWith = /^\*(.*)/;
    const logicTestArray = [
      "and", "AND", "or", "OR", "("
    ];
    let filterPortions: string[] = str.split(' ');
    let processedString='';

    try {
      filterPortions.forEach((portion: string) => {
        if(regexContains.test(portion)) {
          if (!logicTestArray.includes(filterArray[filterArray.length - 1]) && filterArray.length > 0) {
            filterArray.push("and");
          }
          filterArray.push(`contains(Name, '${portion.replace(/\*/g,'')}')`);
        } else if (regexEndsWith.test(portion)) {
          if (!logicTestArray.includes(filterArray[filterArray.length - 1]) && filterArray.length > 0) {
            filterArray.push("and");
          }
          filterArray.push(`endswith(Name, '${portion.replace(/\*/g,'')}')`);
        } else if (regexStartsWith.test(portion)) {
          if (!logicTestArray.includes(filterArray[filterArray.length - 1]) && filterArray.length > 0) {
            filterArray.push("and");
          }
          filterArray.push(`startswith(Name, '${portion.replace(/\*/g,'')}')`);
        } else {
          filterArray.push(portion);
        }
      });
      processedString = filterArray.join(' ');
      //console.log('final replacement: ', processedString);

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
    //console.log(searchOptions);
    // return odata/v1/Products?$count=true with additional optional filters response in JSON Format
    let order = 'PublicationDate';
    let sort = 'desc';
    let skip = 0;
    let productsCountUrl = AppConfig.settings.baseUrl + 'odata/v1/Products?$count=true&$top=1';
    let productsUrl = AppConfig.settings.baseUrl + 'odata/v1/Products?$expand=Attributes';
    //The option $count=true requires only the $filter parameter. No $orderby or $skip is needed for the count.
    //The $top is fixed to 1
    let filter = "";
    let checkWildcard = (searchOptions && searchOptions.filter) ? searchOptions.filter.replace(/\*/g, '') : '';
    if(searchOptions && searchOptions.filter && searchOptions.filter.trim() && checkWildcard) {
      filter = this.parseFilter(searchOptions.filter);
    }
    if(searchOptions && searchOptions.productFilter) {
      filter = (filter) ? filter + ' and (' + searchOptions.productFilter + ')' : searchOptions.productFilter
    }
    if(searchOptions && searchOptions.attributeFilter) {
      filter = (filter) ? filter + ' and (' + searchOptions.attributeFilter + ')' : searchOptions.attributeFilter
    }
    if(searchOptions && searchOptions.geoFilter) {
      filter = (filter) ? filter + ' and ' + searchOptions.geoFilter : searchOptions.geoFilter
    }
    if(filter) {
      productsUrl+='&$filter=' + filter;
      productsCountUrl+='&$filter=' + filter;
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
    //console.log("Sent URL: " + productsUrl);

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
    let uuidURL = AppConfig.settings.quicklookURL.replace('<base_url>', AppConfig.settings.baseUrl).replace('<uuid>', uuid);

    return this.http.get(
      uuidURL, {
        responseType: 'blob'
      })
    .pipe(
      catchError(e => of(e)));
  }

  download(url: string, filename: string): Observable<Download> {
    return this.http.get(url, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    }).pipe(download(blob => saveAs(blob, filename)))
  }
}
