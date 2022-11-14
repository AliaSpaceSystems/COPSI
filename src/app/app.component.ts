import { Component, OnInit} from '@angular/core';
import { AuthConfig, OAuthService, OAuthSuccessEvent } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { AppConfig } from './services/app.config';
import { ExchangeService } from './services/exchange.service';
import { authFlowConfig } from './services/oauth/auth.config';
import { ToastComponent } from './toast/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title: string = 'COPSI';
  name: string = "";
  ssoConfig: AuthConfig = new AuthConfig({});

  constructor( private oauthService: OAuthService, 
    private exchangeService: ExchangeService,
    private toast: ToastComponent) {
  }

  ngOnInit(): void {
    this.initConfig();
    this.configureSSO();
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.name) ? userClaims.name : "";
    this.oauthService.events.subscribe(event => {
      if (event instanceof OAuthSuccessEvent) {
        if(event.type == 'token_received') {
          console.log('token_received');
          //console.log(this.oauthService.getAccessToken());
          this.toast.showInfoToast('LOGIN SUCCESSFUL!')
          this.exchangeService.setIsLogged(true);

        }
        
      } else {
        console.warn(event);
      }
    });
  }

  initConfig() {
    if(AppConfig.settings.keycloak) {
      this.ssoConfig = AppConfig.settings.keycloak

    } else {
      this.ssoConfig = authFlowConfig;
    }
  }

  configureSSO() {
      console.log(this.ssoConfig);
      this.oauthService.configure(this.ssoConfig);      
      this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      this.oauthService.loadDiscoveryDocumentAndTryLogin();
      //console.log(this.oauthService.getAccessToken());
      //console.log(this.oauthService.hasValidAccessToken());
    
  }

  get token() {
    let claims: any = this.oauthService.getIdentityClaims();
    return claims ? claims : null;
  }

}
