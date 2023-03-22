// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  configFile: 'assets/config/config.dev.json',
  detailsFile: 'assets/config/product_details.json',
  keycloak: {
    // Url of the Identity Provider
    issuer: "https://<keycloak_url>/auth/realms/<realm>",

    // URL of the SPA to redirect the user to after login
    redirectUri: "http(s)://<copsy_domain>/home",

    // The SPA's id.
    // The SPA is registerd with this id at the auth-serverß
    clientId: "<client_id>",

    responseType: 'code',
    // set the scope for the permissions the client should request
    // The first three are defined by OIDC.
    scope: 'openid profile email',
    requireHttps: false,
    // at_hash is not present in JWT token
    showDebugInformation: false,
    disableAtHashCheck: true,
    useSilentRefresh: false
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
