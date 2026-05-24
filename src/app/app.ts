import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdleLogoutService } from './core/services/auth/idle-logout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('pup-test-fe');
  private readonly idleLogoutService = inject(IdleLogoutService);

  ngOnInit(): void {
    this.idleLogoutService.startWatching();
  }
}
