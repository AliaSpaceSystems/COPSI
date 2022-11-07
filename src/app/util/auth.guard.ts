import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OAuthConfigService } from '../services/oauth/oauth-config.service';
import { OAuthService, OAuthStorage } from 'angular-oauth2-oidc';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private oauthService: OAuthConfigService,
        private oauthStorage: OAuthStorage
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log("canActivate and check token...");
        console.log(sessionStorage.getItem('access_token'));
        console.log("canActivate and check token localStorage...");
        console.log(localStorage.getItem('access_token'));
        var token = this.oauthStorage.getItem('access_token')

        if (token) {            
            return true; 
        } else {
            
            this.router.navigate(['/login']);
            return false; 
        }

    }
}
