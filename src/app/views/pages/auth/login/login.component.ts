import { NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { FormsModule, NgForm, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/interfaces/user';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-login',
    imports: [
      CommonModule,
      NgStyle,
      RouterLink,
      FormsModule,
      ReactiveFormsModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  loggedin: boolean = false;
  Urfc: string = '';
  Upassword: string = '';
  userRole$: Observable<string | undefined>;
  formLogin: FormGroup;

  public _userService = inject(UserService);

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.userRole$ = this._userService.currentUser$.pipe(
      map(user => user?.rol_users?.role?.name)
    );

    this.formLogin = this.fb.group({
      Urfc: [null, Validators.required],
      Upassword: [null, Validators.required],
    },{
        validators: []
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/agenda-comision/sesiones';

  }

onLoggedin(form: NgForm) {
  const user: User = {
    name: form.value.Urfc,
    password: form.value.Upassword
  };

  this._userService.login(user).subscribe({
    next: (response: any) => {
      const userData = response.user;
      const bandera = response.bandera;
      console.log(userData)
      // Ya no guardes el token
      localStorage.setItem('isLoggedin', 'true'); // opcional
      this._userService.setCurrentUser(userData);
      this.router.navigate([this.returnUrl]);
      /*if (bandera) {
        this.router.navigate(['/registro']);
      } else {
        this.router.navigate([this.returnUrl]);
      }*/
    },
    error: (e: HttpErrorResponse) => {
      if (e.status === 400) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Usuario no existe.",
          showConfirmButton: false,
          timer: 3000
        });
      } else if (e.status === 402) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Contraseña incorrecta.",
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        console.error('Error desconocido:', e);
      }
    },
  });
}

}
