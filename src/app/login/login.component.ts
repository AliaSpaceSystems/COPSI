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
    console.log(AppConfig.settings);
  }

  ngOnInit(): void {
    
    if(this.oauthService.hasValidAccessToken()) {      
      console.log('I amhere');
      document.getElementById('main-login-container')!.style.display = 'none';
      this.route.navigate(['/home']);
      
    } 
  }

  onLoginClicked() {
    //this.userIsLogged = true;
    document.getElementById('main-login-container')!.style.display = 'none';
    //window.location.href = AppConfig.settings.keycloak.loginUrl;
    //this.oauthService.resetImplicitFlow();
    //this.oauthService.;
    this.oauthService.initCodeFlow();
    console.log(this.oauthService.getAccessToken());
    alert('vedi il token');
  }

  onSignupClicked() {
    document.getElementById('main-login-container')!.style.display = 'none';
    window.location.href = environment.keycloak.issuer + environment.keycloak.registrationPath + environment.keycloak.clientId;
    //this.oauthService.r();
  } 

  reloadPage(){
    window.location.reload()
  }
}
