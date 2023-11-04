import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8050';

  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) { }

  // subscribe to push notification
  subscribeToNotification(publicKey: string) {
    this.swPush.requestSubscription({
      serverPublicKey: publicKey
    })
    .then(sub => {
      this.http.post(`${this.apiUrl}/subscribe`, sub).subscribe();
    })
    .catch(err => console.error('Could not subscribe to notifications', err));
  }
}
