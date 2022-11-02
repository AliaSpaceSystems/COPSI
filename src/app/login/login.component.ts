import { Component, OnInit } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
  }

  onLoginClicked() {
    this.userIsLogged = true;
    document.getElementById('main-login-container')!.style.display = 'none';
  }
}
