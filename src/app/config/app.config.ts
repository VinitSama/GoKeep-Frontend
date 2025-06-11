import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';

// const baseUrl = 'https://localhost:5117/';
const baseUrl = 'https://13.228.225.19:8080/';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideHttpClient(withFetch(), withInterceptors([authInterceptor])), provideAnimationsAsync()]
};

export const API = {
  api: `${baseUrl}GoKeep`
};