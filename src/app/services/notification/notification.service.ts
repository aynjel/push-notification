import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PublicKey, SubscriptionPayload } from 'src/models/notificationModel';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) { }

  async allowNotification(): Promise<any> {
    return await Notification.requestPermission().then((status) => {
      console.log(status);
      if(status === 'granted'){
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  }

  checkSubscription(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.pushManager.getSubscription().then((sub) => {
          if(sub === null || sub === undefined){
            console.log('Not Subscribed');
            resolve(false);
          } else {
            console.log('Success Subscription', sub);
            resolve(true);
          }
        });
      });
    });
  }

  getPublicKey(): Observable<PublicKey> {
    return this.http.get<PublicKey>(`${environment.DEV_CHH_PN}/subscribe`);
  }

  requestSubscription(publicKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.swPush.requestSubscription({
        serverPublicKey: publicKey,
      }).then((sub) => {
        resolve(sub);
      }).catch((err) => reject(err));
    });
  }

  subscribeNotification(subsPayload:any): Observable<SubscriptionPayload> {
    const fullPayload = {
      subscription: subsPayload,
      app: 'doki',
      userId: '789456123125',
    };
    return this.http.post<SubscriptionPayload>(`${environment.DEV_CHH_PN}/subscribe`, fullPayload);
  }

  unSubscribeNotification(): Observable<any> {
    this.swPush.unsubscribe();
    return this.http.delete(`${environment.DEV_CHH_PN}/subscribe`);
  }
}
