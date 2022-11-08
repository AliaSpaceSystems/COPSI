import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfig } from '../services/app.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public userIsLogged = false;  // temp variable to show login form
  public showSignUp = AppConfig.settings.loginSettings.showSignUp;
  public loginText = AppConfig.settings.loginSettings.text;
  public showForgotPassword = AppConfig.settings.loginSettings.showForgotPassword;

  constructor(private oauthService: OAuthService) {
    console.log(AppConfig.settings);
    /*this.oauthService.loginUrl = AppConfig.settings.keycloak.loginUrl;
    this.oauthService.redirectUri = AppConfig.settings.keycloak.redirectUri;
    this.oauthService.clientId = AppConfig.settings.keycloak.clientId;
    this.oauthService.scope = AppConfig.settings.keycloak.scope;
    this.oauthService.setStorage(localStorage); 
    this.oauthService.logoutUrl = AppConfig.settings.keycloak.logoutUrl;
    this.oauthService.tokenEndpoint = AppConfig.settings.keycloak.redirectUri;*/
    //this.oauthService.tryLogin();

  }

  ngOnInit(): void {
  }

  onLoginClicked() {
    //this.userIsLogged = true;
    document.getElementById('main-login-container')!.style.display = 'none';
    //window.location.href = AppConfig.settings.keycloak.loginUrl;
    //this.oauthService.revokeTokenAndLogout();
    //this.oauthService.resetImplicitFlow();
    //this.oauthService.;
    this.oauthService.initCodeFlow();
  }
}
