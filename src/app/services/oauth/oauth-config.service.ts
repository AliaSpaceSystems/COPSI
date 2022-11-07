import { Injectable } from '@angular/core';
import { AuthConfig, NullValidationHandler, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class OAuthConfigService {

  private _decodedAccessToken: any;
    private _decodedIDToken: any;
    get decodedAccessToken() { return this._decodedAccessToken; }
    get decodedIDToken() { return this._decodedIDToken; }

    constructor(
      private readonly oauthService: OAuthService,
      private readonly authConfig: AuthConfig,
      private readonly storage: OAuthStorage
    ) {}

    async initAuth(): Promise<any> {
      console.log(AppConfig.settings);
      return new Promise<void>((resolveFn, rejectFn) => {
        // setup oauthService
        this.oauthService.configure(this.authConfig);
        this.oauthService.setStorage(localStorage);
        this.oauthService.tokenValidationHandler = new NullValidationHandler();
  
        // subscribe to token events
        this.oauthService.events
          .pipe(filter((e: any) => {
            return e.type === 'token_received';
          }))
          .subscribe(() => this.handleNewToken());
        // disabling keycloak for now
         // resolveFn();
        // continue initializing app or redirect to login-page
        console.log("access_token ??", this.storage.getItem('access_token'));
        this.oauthService.tryLogin().then(isLoggedIn => {
          console.log(this.oauthService.getAccessToken());
          console.log("isLoggedIn",isLoggedIn);

          if (isLoggedIn) {
            this.oauthService.setupAutomaticSilentRefresh();
            resolveFn();
          } else {
            this.oauthService.initImplicitFlow();
            rejectFn();
          }
        });
        
      });
    }
  
    private handleNewToken() {
      this._decodedAccessToken = this.oauthService.getAccessToken();
      this._decodedIDToken = this.oauthService.getIdToken();
    }
}
