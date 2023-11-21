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

  getPublicKey(): Observable<any> {
    return this.http.get(environment.pushNotificationApi);
  }

  subscribeToNotification(payload:any): Observable<any> {
    return this.http.post(`${environment.pushNotificationApi}`, payload);
  }
}
