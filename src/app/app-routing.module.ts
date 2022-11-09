import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './util/auth.guard';

const routes: Routes = [
  /* Main routes */
  { path: 'login', component: LoginComponent, runGuardsAndResolvers: 'always'},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] , runGuardsAndResolvers: 'always'
  //  , children: [
  //    /* Auxiliary routes */
  //    { path: 'network-component/:mapType', outlet: 'centralBodyRouter', component: NetworkViewComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  //    { path: 'completeness-component', outlet: 'centralBodyRouter', component: CompletenessComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  //    { path: 'publication-latency-component', outlet: 'centralBodyRouter', component: PublicationLatencyComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  //    { path: 'service-availability', outlet: 'centralBodyRouter', component: ServiceAvailabilityComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
  //    { path: '', outlet: 'centralBodyRouter', component: NetworkViewComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'}
  //  ]
  },
  
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
