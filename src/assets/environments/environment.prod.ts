export const environment = {
  production: true,
  configFile: 'assets/config/config.json',
  keycloak: {
    // Url of the Identity Provider
    //issuer: 'https://keycloak.alia-space.com/auth/realms/PRIP-S2',
    issuer: 'https://keycloak.alia-space.com/auth/realms/dhus',

    // URL of the SPA to redirect the user to after login
    redirectUri: 'http://localhost:4200/login',
 
    // The SPA's id. 
    // The SPA is registerd with this id at the auth-serverß
    //clientId: 'prip-api',
    clientId: 'dafne',

    responseType: 'code',
    // set the scope for the permissions the client should request
    // The first three are defined by OIDC.
    scope: 'openid profile email',
    // Remove the requirement of using Https to simplify the demo
    // THIS SHOULD NOT BE USED IN PRODUCTION
    // USE A CERTIFICATE FOR YOUR IDP
    // IN PRODUCTION
    requireHttps: false,
    // at_hash is not present in JWT token
    showDebugInformation: true,
    disableAtHashCheck: true,
    registrationPath: '/login-actions/registration?client_id='
  }
};
