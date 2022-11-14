import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Subscription } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { AppConfig } from '../services/app.config';
import { ExchangeService } from '../services/exchange.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  public userIsLogged = false;  // temp variable to show login form
  public showSignUp = AppConfig.settings.loginSettings.showSignUp;
  public loginText = AppConfig.settings.loginSettings.text;
  public showForgotPassword = AppConfig.settings.loginSettings.showForgotPassword;
  isLoggedSubscription!: Subscription;

  constructor(private oauthService: OAuthService, 
    private exchangeService: ExchangeService) {
    
  }

  ngOnInit(): void {
    
    if(this.oauthService.hasValidAccessToken()) {      
      //document.getElementById('main-login-container')!.style.display = 'none';
      this.userIsLogged = true;
    } else {
      this.userIsLogged = false
    }
    this.setComponentVisibility(this.userIsLogged);
  }

  ngAfterViewInit(): void {
    
    this.isLoggedSubscription = this.exchangeService.isLoggedExchange.subscribe((value) => {
      if (typeof(value) === 'boolean') {
        this.setComponentVisibility(value);
      }
    });
    
  }

  ngOnDestroy(): void {
    this.isLoggedSubscription.unsubscribe();
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

  setComponentVisibility(isLogged: boolean) {
    if(isLogged) {
      document.getElementById('main-login-container')!.style.display = 'none';
    } else {
      document.getElementById('main-login-container')!.style.display = 'flex';
    }
  }

  
}
