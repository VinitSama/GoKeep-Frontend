import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequestModel } from '../../models/login-request-model';
import { AuthenticationService } from '../../services/authentication.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private AuthService: AuthenticationService, 
    private snackbarService: SnackbarService,
  ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['testE', [Validators.required]],
      password: ['testP', [Validators.required]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async onLogin() {
    if (this.loginForm.valid){
      const loginRequest: LoginRequestModel = this.loginForm.value;
      const response = await this.AuthService.loginRequest(loginRequest);
      if (response?.responseCode == 200 && response.data){
        // this.AuthService.setAuthentication(true);
        // this.AuthService.saveEmail(loginRequest.email)
        // this.localSaveService.set(Token, response.data)
        // this.router.navigate(["../"]);
        // this.AuthService.getTokenExpiry(response.data);
        this.AuthService.login(response.data);
      }
      else {
        console.log("login Unsuccess!");
        this.snackbarService.openSnackbar(response?.description || "login Unsuccess!");
      }

    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}
