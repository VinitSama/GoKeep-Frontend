import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGaurdService } from './services/auth-gaurd.service';

export const routes: Routes = [
    {
        path: '',
        pathMatch: "full",
        redirectTo: 'home',
        // canActivate: [AuthGaurdService]
    },
    {
        path: 'login',
        loadComponent: () => import("./components/login/login.component").then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import("./components/sign-up/sign-up.component").then(m => m.SignUpComponent)
    },
    {
        path: 'home',
        loadComponent: () => import("./components/home/home.component").then(m => m.HomeComponent),
        canActivate: [AuthGaurdService]
    },
    // {
    //     path: 'dummy',
    //     loadComponent: () => import("./dummy/dummy.component").then(m=>m.DummyComponent),
    // },
    {
        path:'**',
        redirectTo: 'home'
    }
];
