import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/shared/auth/auth.service';
import {routes} from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public routes = routes;
  public passwordClass = false;
  public ERROR = false;
  isLoading = false;
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(public auth: AuthService, public router: Router) {
  }

  ngOnInit(): void {
    if (localStorage.getItem('authenticated')) {
      this.router.navigate([routes.adminDashboard]);
    }
  }

  loginFormSubmit() {
    if (this.form.valid) {
      this.showLoading();
      this.ERROR = false;

      const email = this.form.value.email ? this.form.value.email : '';
      const password = this.form.value.password ? this.form.value.password : '';

      this.auth.login(email, password)
        .subscribe({
          next: (resp: any) => {
            if (resp) {
              document.location.reload();
              this.hideLoading();
            } else {
              this.hideLoading();
              this.ERROR = true;
            }
          },
          error: (error) => {
            this.hideLoading();
            console.log(error);
          }
        });
    }
  }

  togglePassword() {
    this.passwordClass = !this.passwordClass;
  }

  private showLoading() {
    this.isLoading = true;
  }

  private hideLoading() {
    this.isLoading = false;
  }
}
