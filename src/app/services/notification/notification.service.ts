import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  getPublicKey(): Observable<any> {
    return this.http.get(environment.pushNotificationApi);
  }

  requestSubscription(publicKey: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.swPush.requestSubscription({
        serverPublicKey: publicKey,
      }).then((sub) => {
        resolve(sub);
      }).catch((err) => reject(err));
    });
  }

  subscribeToNotification(payload:any): Observable<any> {
    const fullPayload = {
      subscription: payload,
      app: 'doki',
      userId: '123456789123',
    };
    return this.http.post(environment.pushNotificationApi, fullPayload);
  }

  async unSubscribeToNotification(): Promise<any> {
    return await navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.pushManager.getSubscription().then((sub) => {
        if(sub === null || sub === undefined){
          console.log('Not Subscribed');
        } else {
          sub.unsubscribe();
          console.log('Unsubscribed', sub);
        }
      });
    });
  }
}
