import { Component, OnInit} from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OAuthService, OAuthSuccessEvent } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { authFlowConfig } from './services/oauth/auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title: string = 'COPSI';
  name: string = "";

  constructor( private oauthService: OAuthService, private route: Router) {
  }

  ngOnInit(): void {
    this.configureSSO();
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.name) ? userClaims.name : "";
    this.oauthService.events.subscribe(event => {
      if (event instanceof OAuthSuccessEvent) {
        if(event.type == 'token_received') {
          console.log('token_received');
          console.log(this.oauthService.getAccessToken());
          this.route.navigate(['/home']);

        }
        
      } else {
        console.warn(event);
      }
    });
  }

  configureSSO() {
    
      this.oauthService.configure(authFlowConfig);      
      this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      this.oauthService.loadDiscoveryDocumentAndTryLogin();
      console.log('configured');
      //this.oauthService.initCodeFlow();
      console.log('configuinitCodeFlow');
      console.log(this.oauthService.getAccessToken());
      console.log(this.oauthService.hasValidAccessToken());
    
  }

  get token() {
    let claims: any = this.oauthService.getIdentityClaims();
    return claims ? claims : null;
  }

}
