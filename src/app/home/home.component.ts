import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { authFlowConfig } from '../services/oauth/auth.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  name: string = "";

  constructor( private oauthService: OAuthService) {
  }

  ngOnInit(): void {
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.name) ? userClaims.name : "";
  }

  get token() {
    let claims: any = this.oauthService.getIdentityClaims();
    return claims ? claims : null;
  }

}
