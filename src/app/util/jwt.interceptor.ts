import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OAuthService } from 'angular-oauth2-oidc';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private oauthService: OAuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        /* add authorization header with jwt token if available */
        const token = this.oauthService.getAccessToken();
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