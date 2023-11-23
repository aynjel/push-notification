import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ToastController } from '@ionic/angular';
import { IndexDbService } from 'src/app/services/indexDb/index-db.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  numbers: number[] = [];

  sub: any;

  endpoint: any;
  expirationTime: any;
  auth: any;
  p256dh: any;

  constructor(
    private notification: NotificationService,
    private toastCtrl: ToastController
  ) {
    for (let i = 0; i < 10; i++) {
      this.numbers.push(i);
    }
  }

  ngOnInit() {
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
    });
    toast.present();
  }

  // hard reload browser and clear cache
  clearData() {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });

    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });

    window.location.reload();
  }

  async subscribeToNotification() {
    this.notification.getPublicKey().subscribe({
      next: (res: any) => {
        console.log('Get Public Key from Server', res);
        // Request subscription
        this.notification.requestSubscription(res.data.publicKey).then((sub) => {
          console.log('Request Subscription using Public Key', sub);
          this.sub = sub;
          this.endpoint = sub.endpoint;
          // this.expirationTime = sub.expirationTime;
          // this.auth = sub.keys.auth;
          // this.p256dh = sub.keys.p256dh
          // Send subscription to server
          this.notification.subscribeToNotification(sub).subscribe({
            next: (data) => console.log(data),
            error: (err) => console.log(err),
          });
        }).catch((err) => console.log(err));
      },
      error: (err) => console.log(err),
    });
  }

  async unSubscribeToNotification() {
    if (Notification.permission === 'granted') {
      this.notification.unSubscribeToNotification();
    }
  }

  async allowNotification() {
    this.notification.allowNotification();
  }

  async checkSubscription() {
    this.notification.checkSubscription();
  }

  // postSync(){
  //   const object = {
  //     name: 'Tests'
  //   };

  //   this.http.post('http://localhost:8050/data', object).subscribe({
  //     next: (data) => console.log(data),
  //     error: (err) => {
  //       console.log(err);
  //       this.indexDB.addUser(object.name);
  //       this.backgroundSync();
  //     }
  //   });
  // }

  // sendPush(){
  //   this.http.post('http://localhost:8050/push', {}).subscribe({
  //     next: (data) => console.log(data),
  //     error: (err) => console.log(err)
  //   });
  // }

  backgroundSync(){
    navigator.serviceWorker.ready.then((swRegistration) => {
      swRegistration.sync.register('post-data');
    }).catch((err) => console.log(err));
  }

}
