import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './util/auth.guard';

const routes: Routes = [
  /* Main routes */
  { path: 'login', component: LoginComponent, runGuardsAndResolvers: 'always'},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] , runGuardsAndResolvers: 'always'},
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
