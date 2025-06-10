import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterationRequestModel } from '../../models/registeration-request-model';
import { AuthenticationService } from '../../services/authentication.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {

  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private AuthService: AuthenticationService,
    private snackbarService: SnackbarService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: [''],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    })
  }

  async onSignup() {
    if (this.signupForm.valid) {
      const registerationRequest: RegisterationRequestModel = this.signupForm.value;
      const response = await this.AuthService.registerationRequest(registerationRequest);
      console.log(response);
      if (response?.responseCode == 201 ){
        // this.AuthService.setAuthentication(true);
        // this.AuthService.saveEmail(registerationRequest.email)
        // this.router.navigate(["../"]);
        this.snackbarService.openSnackbar("User register successfull")
      }
      else {
        console.log("register unsuccessfull");
        this.snackbarService.openSnackbar(response?.description || "register unsuccessfull");
      }
    }else {
      this.signupForm.markAllAsTouched();
    }
  }

  get firstName(){
    return this.signupForm.get('firstName');
  }

  get lastName(){
    return this.signupForm.get('lastName');
  }

  get email(){
    return this.signupForm.get('email');
  }

  get password(){
    return this.signupForm.get('password');
  }

}
