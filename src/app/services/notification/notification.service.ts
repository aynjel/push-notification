import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PublicKey, SubscriptionPayload } from 'src/models/notificationModel';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient
  ) { }

  getPublicKey(): Observable<PublicKey> {
    return this.http.get<PublicKey>(`${environment.DEV_CHH_PN}/subscribe`);
  }

  subscribeNotification(subsPayload:PushSubscription): Observable<SubscriptionPayload> {
    const fullPayload = {
      subscription: subsPayload,
      app: 'resi',
      userId: '789456123125',
    };
    return this.http.post<SubscriptionPayload>(`${environment.DEV_CHH_PN}/subscribe`, fullPayload);
  }

  unSubscribeToNotifications(subEndpoint: string): Observable<any> {
    const url = environment.DEV_CHH_PN;
    return this.http.delete<any>(`${url}/subscribe`, { body: { endpoint: subEndpoint } });
  }
}
