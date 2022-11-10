// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  configFile: 'assets/config/config.dev.json',
  keycloak: {
    // Url of the Identity Provider
    //issuer: 'https://s1a.prip.copernicus.eu/auth/realms/prip_s1a/protocol/openid-connect/auth',
    issuer: 'https://keycloak.alia-space.com/auth/realms/dhus',

    // URL of the SPA to redirect the user to after login
    //redirectUri: 'https://s1a.prip.copernicus.eu/odata/v1/Products',
    redirectUri: 'http://192.168.56.103:4400/login',

    // The SPA's id. 
    // The SPA is registerd with this id at the auth-serverß
    clientId: 'dafne',
    //clientId: 'spa',

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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
