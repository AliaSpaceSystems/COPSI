import { Component, OnInit} from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
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

  constructor( private oauthService: OAuthService) {
  }

  ngOnInit(): void {
    this.configureSSO();
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.name) ? userClaims.name : "";
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
