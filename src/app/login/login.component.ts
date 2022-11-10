import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';
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

  constructor(private oauthService: OAuthService, private route: Router) {
    
  }

  ngOnInit(): void {
    
    if(this.oauthService.hasValidAccessToken()) {      
      //document.getElementById('main-login-container')!.style.display = 'none';
      this.userIsLogged = true;
      this.route.navigate(['/home']);
    } else {
      this.userIsLogged = false
    }
  }

  onLoginClicked() {
    //document.getElementById('main-login-container')!.style.display = 'none';
    this.oauthService.initCodeFlow();
    console.log(this.oauthService.getAccessToken());    
  }

  onSignupClicked() {
    //document.getElementById('main-login-container')!.style.display = 'none';
    window.location.href = environment.keycloak.issuer + environment.keycloak.registrationPath + 
    environment.keycloak.clientId + '&response_type=code&scope=openid profile&redirect_uri=' + environment.keycloak.redirectUri;   
  } 

  
}
