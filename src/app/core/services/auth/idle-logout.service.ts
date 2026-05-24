import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IdleLogoutService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  private timerId: ReturnType<typeof setTimeout> | null = null;

  // 15 minutes idle time
  private readonly idleLimitMs = 15 * 60 * 1000;

  private readonly activityEvents = [
    'mousemove',
    'mousedown',
    'keydown',
    'click',
    'scroll',
    'touchstart'
  ];

  startWatching(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.stopWatching();

    this.ngZone.runOutsideAngular(() => {
      this.activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, this.resetTimer);
      });

      this.resetTimer();
    });
  }

  stopWatching(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, this.resetTimer);
    });

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private readonly resetTimer = (): void => {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.timerId = setTimeout(() => {
      this.ngZone.run(() => {
        this.handleIdleTimeout();
      });
    }, this.idleLimitMs);
  };

  private handleIdleTimeout(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.authService.logoutRequest().subscribe({
      next: () => {
        this.forceLogout();
      },
      error: () => {
        this.forceLogout();
      }
    });
  }

  private forceLogout(): void {
    this.stopWatching();

    this.authService.logout();

    alert('Your session has expired due to inactivity. Please log in again.');

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}