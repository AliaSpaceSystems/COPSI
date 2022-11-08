import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule, AuthConfig } from 'angular-oauth2-oidc';

import { OAuthConfigService } from './oauth-config.service';
import { authFlowConfig } from './auth.config';

export function init_app(oauthConfigService: OAuthConfigService) {
    return () => oauthConfigService.initAuth();
}

@NgModule({
  imports: [ HttpClientModule, OAuthModule.forRoot() ],
  providers: [
    OAuthConfigService,
    { provide: AuthConfig, useValue: authFlowConfig },
    //OAuthModuleConfig,
    { 
      provide: APP_INITIALIZER, 
      useFactory: init_app, 
      deps: [ OAuthConfigService ], 
      multi: true
    }
  ]
})
export class AuthConfigModule { }