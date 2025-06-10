import { Injectable } from '@angular/core';

export const JwtToken = 'JwtToken';
export const RefreshToken = 'refreshToken';

@Injectable({
  providedIn: 'root'
})
export class LocalSaveService {

  
  constructor() { }

  set(key: string, val: string){
    localStorage.setItem(key, val);
  }

  get(key: string){
    return localStorage.getItem(key);
  }

  delete(key: string) {
    localStorage.removeItem(key);
  }

}
