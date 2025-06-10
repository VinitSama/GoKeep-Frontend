import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '../config/app.config';
import { ApiResponseModel } from '../models/api-response-model';
import { LoginRequestModel } from '../models/login-request-model';
import { firstValueFrom } from 'rxjs';
import { RegisterationRequestModel } from '../models/registeration-request-model';
import { RegisterationResponseModel } from '../models/registeration-response-model';
import { LocalSaveService, JwtToken, RefreshToken } from './local-save.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { TokenModel } from '../models/token-model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private api = API.api;
  private _isAuthenticated: boolean = false;
  private logoutTimer: any;

  constructor(
    private http: HttpClient,
    private localSaveService: LocalSaveService,
    private router: Router,
  ) { }

  async loginRequest(loginRequestModel: LoginRequestModel){
    try{
      const url = `${this.api}/login`
      const response = await firstValueFrom(this.http.post<ApiResponseModel<TokenModel>>(url, loginRequestModel));
      return response;
    } catch(error){
      console.error(error);
      return;
    }
  }

  async registerationRequest(registerationRequestModel: RegisterationRequestModel){
    try{
      const url = `${this.api}/registration`;
      const response = await firstValueFrom(this.http.post<ApiResponseModel<RegisterationResponseModel>>(url, registerationRequestModel));
      return response;
    } catch(error){
      console.error(error);
      return;
    }
  }

  async refreshToken() {
    try {
      const url = `${this.api}/${this.localSaveService.get(RefreshToken)}`;
      const response = await firstValueFrom(this.http.get<ApiResponseModel<TokenModel>>(url));
      return response;
    } catch(error){
      console.error(error);
      return;
    }
  }

  private setAuthentication(val: boolean) {
    this._isAuthenticated = val;
  }

  isAuthenticated():boolean {
    return this._isAuthenticated;
  }

  login(token: TokenModel) {
    this.setAuthentication(true);
    this.localSaveService.delete(RefreshToken);
    this.localSaveService.delete(JwtToken);
    this.saveTokens(token);
    this.router.navigate(["../"]);
    // this.router.navigate(["dummy"])
    this.startSession(token);
  }

  logout() {
    this.setAuthentication(false);
    this.localSaveService.delete(JwtToken);
    this.clearSessionTimer();
    this.router.navigate(["../login"]);
  }

  private async onTimeOut() {
    const response = await this.refreshToken();
    if (response?.responseCode == 200 && response.data) {
      this.saveTokens(response.data);
      this.startSession(response.data);
    } else {
      this.logout();
    }
  }

  saveTokens(token: TokenModel) {
    this.localSaveService.set(JwtToken, token.jwtToken);
    this.localSaveService.set(RefreshToken, token.refreshToken);
  }

  private clearSessionTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }

  private async startSession(token: TokenModel) {
    const expiry = this.getTokenExpiry(token.jwtToken);
    const timeout = expiry - Date.now();
    if (timeout > 0) {
      this.logoutTimer = await setTimeout(() => {
        this.onTimeOut();
      }, timeout);
    } else {
      this.logout();
    }
  }

  private getTokenExpiry(token: string): number {
    try {
      const decode: any = jwtDecode(token);
      return decode.exp*1000;
    } catch (e) {
      return 0;
    }
  }

}
