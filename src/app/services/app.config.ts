import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppConfig {
    static settings: any;
    constructor(private http: HttpClient) {}

    load() {
        const jsonFile = 'assets/config/config.json';
        return new Promise<void>((resolve, reject) => {
            firstValueFrom(this.http.get(jsonFile)).then((response : any) => {
               AppConfig.settings = response;
               resolve();
            }).catch((response: any) => {
               reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
            });
        });
    }
}