import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ToastController } from '@ionic/angular';
import { IndexDbService } from 'src/app/services/indexDb/index-db.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  numbers: number[] = [];

  sub: any;
  isSubscribed: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private toastCtrl: ToastController,
    private swPush: SwPush,
  ) {
    for (let i = 0; i < 10; i++) {
      this.numbers.push(i);
    }
  }

  ngOnInit() {
  }

  async requestPermission() {
    await this.notificationService.allowNotification().then((res) => {
      if (res) {
        this.presentToast('Permission Granted');
      }
      console.log(res);
    });
  }

  checkSubscription() {
    this.notificationService.checkSubscription().then((res) => {
      this.isSubscribed = res;
      console.log(res);
    });
  }

  subscribeNotification() {
    this.notificationService.getPublicKey().subscribe({
      next: async (res) => {
        const publicKey = res.data.publicKey;
        const subscription = await this.notificationService.requestSubscription(publicKey);
        console.log("Public key: ", publicKey);
        console.log("Subscription: ", subscription);
        this.notificationService.subscribeNotification(subscription).subscribe({
          next: (data) => {
            this.presentToast('Subscribed');
            this.isSubscribed = true;
            this.sub = data;
            console.log("Subscription Payload: ", data);
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }

  unsubscribeNotification() {
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.pushManager.getSubscription().then((sub) => {
        console.log('getSubscription: ', sub);
        const subEndpoint = sub?.endpoint || '';
        this.notificationService.unSubscribeToNotifications(subEndpoint).subscribe({
          next: (data) => {
            console.log(data);
            this.isSubscribed = false;
          },
          error: (err) => console.error(err)
        });
      });
    });
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

  async presentToast(message: string, status: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: status
    });
    toast.present();
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
