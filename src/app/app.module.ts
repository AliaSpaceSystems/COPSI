import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { AppConfig } from './services/app.config';
import { DetailsConfig } from './services/details.config';
import { FootprintsCustomizationConfig } from './services/footprints_customization.config';
import { JwtInterceptor } from './util/jwt.interceptor';
import { ErrorInterceptor } from './util/error.interceptor';
import { CustomErrorHandler } from './util/error.handler';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HomeComponent } from './home/home.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { AlertComponent } from './alert/alert.component';
import { ToastComponent } from './toast/toast.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}
export function initializeDetails(detailsConfig: DetailsConfig) {
  return () => detailsConfig.load();
}
export function initializeFootprintsCustomization(footprintsCustomizationConfig: FootprintsCustomizationConfig) {
  return () => footprintsCustomizationConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapComponent,
    FooterComponent,
    HeaderComponent,
    SearchBarComponent,
    LoginComponent,
    SpinnerComponent,
    ToastComponent,
    AlertComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    FormsModule,
    HttpClientModule,
    MatProgressBarModule,
    OAuthModule.forRoot({
      resourceServer: {
          allowedUrls: ['/odata/*','/test/*'],
          sendAccessToken: true
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDetails,
      deps: [DetailsConfig], multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFootprintsCustomization,
      deps: [FootprintsCustomizationConfig], multi: true
    },
    { provide: ErrorHandler, useClass: CustomErrorHandler},
    AppConfig,
    DetailsConfig,
    FootprintsCustomizationConfig,
    SpinnerComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
