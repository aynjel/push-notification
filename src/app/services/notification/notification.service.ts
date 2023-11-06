import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8050';
  private readonly publicKey = 'BCol311jRW4M59BwcFAMiESdjaTHaNGQTJ-kC88feFnLEJ6nC-2JFOBcMX-rLRIO8NaaXYwDRCLn1a_s4XgR384';

  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) { }

  // subscribe to push notification
  subscribeToNotification() {
    this.swPush.requestSubscription({
      serverPublicKey: this.publicKey
    })
    .then(sub => {
      this.http.post(`${this.apiUrl}/subscribe`, sub).subscribe();
    })
    .catch(err => console.error(err));
  }
}
