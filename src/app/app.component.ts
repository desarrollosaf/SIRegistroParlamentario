import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeModeService } from './core/services/theme-mode.service';
import { UserService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'demo2';

  private router = inject(Router);
  private userService = inject(UserService);

  constructor(private themeModeService: ThemeModeService) {}

  ngOnInit(): void {
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.userService.getCurrentUser().subscribe({
          error: () => {
            this.userService.clearSession();
            this.router.navigate(['/auth/login']);
          }
        });
      }
    });
  }

}
