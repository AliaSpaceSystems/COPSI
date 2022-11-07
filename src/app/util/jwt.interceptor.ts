import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OAuthStorage } from 'angular-oauth2-oidc';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private oauthStorage: OAuthStorage) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        /* add authorization header with jwt token if available */
        console.log('jwt intercept');
        const token = this.oauthStorage.getItem('access_token');
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request);
    }
}