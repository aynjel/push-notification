import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { IndexDbService } from 'src/app/services/indexDb/index-db.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  numbers: number[] = [];

  constructor(
    private http: HttpClient,
    private indexDB: IndexDbService,
    private swPush: SwPush
  ) {
    for (let i = 0; i < 10; i++) {
      this.numbers.push(i);
    }
  }

  ngOnInit() {
  }

  async SubscribeToNotification() {
    await this.http.get(`${environment.pushNotificationApi}/getSubscribe`).subscribe({
      next: async (res: any) => {
        console.log('getSubscribe', res);
        // Request subscription
        await this.swPush.requestSubscription({
          serverPublicKey: res.publicKey,
        }).then(async (sub) => {
          console.log('requestSubscription', sub);
          await this.http.post(`${environment.pushNotificationApi}/postSubscribe`, {
            // add app and userId to subscription
            subscription: sub,
            userId: '123456789123',
            app: 'doki'
          }).subscribe({
            next: async (res: any) => {
              console.log('postSubscribe', res);
              // enable push api from service worker
              await navigator.serviceWorker.getRegistration().then((reg) => {
                reg?.pushManager.getSubscription().then((sub) => {
                  console.log('pushManager.getSubscription', sub);
                  if(sub === null){
                    console.log('Not subscribed to push notification');
                  } else {
                    console.log('Subscribed to push notification');
                  }
                });
              });
            },
            error: (err) => console.log(err),
          });
        }).catch((err) => console.log(err));
      },
      error: (err) => console.log(err),
    });
  }

  async unSubscribeToNotification() {
    await this.swPush.unsubscribe();
  }

  async allowNotification() {
    await Notification.requestPermission().then((status) => {
      console.log(status);
      if(status === 'granted'){
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  }

  postSync(){
    const object = {
      name: 'Tests'
    };

    this.http.post('http://localhost:8050/data', object).subscribe({
      next: (data) => console.log(data),
      error: (err) => {
        console.log(err);
        this.indexDB.addUser(object.name);
        this.backgroundSync();
      }
    });
  }

  sendPush(){
    this.http.post('http://localhost:8050/push', {}).subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err)
    });
  }

  backgroundSync(){
    navigator.serviceWorker.ready.then((swRegistration) => {
      swRegistration.sync.register('post-data');
    }).catch((err) => console.log(err));
  }

}
