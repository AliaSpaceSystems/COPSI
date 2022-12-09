export const environment = {
  production: true,
  configFile: 'assets/config/config.json',
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
