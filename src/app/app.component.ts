import { Component, OnInit} from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { authFlowConfig } from './services/oauth/auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'COPSI';

  constructor( private oauthService: OAuthService) {
  }

  ngOnInit(): void {
    this.configureSSO();
  }

  configureSSO() {
    this.oauthService.configure(authFlowConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    console.log('configured');
    //this.oauthService.initCodeFlow();
    console.log('configuinitCodeFlow');
  }

}
