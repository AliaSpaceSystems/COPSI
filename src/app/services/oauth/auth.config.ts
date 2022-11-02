import { AuthConfig } from 'angular-oauth2-oidc';
import { AppConfig } from '../app.config';
import { environment } from 'src/environments/environment';

export const authConfig: AuthConfig = {
    
    // Url of the Identity Provider
    issuer: AppConfig.settings.keycloak.issuer,

    // URL of the SPA to redirect the user to after login
    redirectUri: AppConfig.settings.environment.keycloak.redirectUri,

    // The SPA's id. 
    // The SPA is registerd with this id at the auth-serverß
    clientId: AppConfig.settings.keycloak.clientId,

    responseType: AppConfig.settings.keycloak.responseType,
    // set the scope for the permissions the client should request
    // The first three are defined by OIDC.
    scope: AppConfig.settings.keycloak.scope,
    // Remove the requirement of using Https to simplify the demo
    // THIS SHOULD NOT BE USED IN PRODUCTION
    // USE A CERTIFICATE FOR YOUR IDP
    // IN PRODUCTION
    requireHttps: AppConfig.settings.keycloak.requireHttps,
    // at_hash is not present in JWT token
    showDebugInformation: AppConfig.settings.keycloak.showDebugInformation,
    disableAtHashCheck: AppConfig.settings.keycloak.disableAtHashCheck
};


export class OAuthModuleConfig {
    resourceServer: OAuthResourceServerConfig = {sendAccessToken: false};
}

export class OAuthResourceServerConfig {
    /**
     * Urls for which calls should be intercepted.
     * If there is an ResourceServerErrorHandler registered, it is used for them.
     * If sendAccessToken is set to true, the access_token is send to them too.
     */
    allowedUrls?: Array<string>;
    sendAccessToken = true;
    customUrlValidation?: (url: string) => boolean;
}