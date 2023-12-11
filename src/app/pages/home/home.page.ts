import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { AlertController, ToastController } from '@ionic/angular';
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
    private toastController: ToastController,
    private alertController: AlertController,
    private swPush: SwPush
  ) { }

  ngOnInit() {

    if (!localStorage.getItem('pushSubscription')) {
      this.alertController.create({
        header: "Allow Notification",
        message: "Do you want to allow notification?",
        buttons: [
          {
            text: "No",
            role: "cancel",
            handler: () => {
              console.log("Notification permission denied");
            },
          },
          {
            text: "Yes",
            handler: () => {
              this.subscribeToNotifications();
            },
          },
        ],
      }).then((alert) => {
        alert.present();
      });
    }
  }

  subscribeToNotifications(): void {
    this.notificationService.getPublicKey().subscribe({
      next: async (res) => {
        const publicKey = res.data.publicKey;
        const sub = await this.swPush.requestSubscription({
          serverPublicKey: publicKey
        });
        // send subscription to server
        this.notificationService.subscribeNotification(sub).subscribe({
          next: (data) => {
            this.isSubscribed = true;
            this.sub = sub;
            localStorage.setItem('pushSubscription', JSON.stringify(sub));
            console.log("Subscription Payload: ", data);
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }

  unsubscribeNotification() {
    this.swPush.unsubscribe().then(() => {
      this.notificationService.unSubscribeToNotifications(this.sub.endpoint).subscribe({
        next: (data) => {
          this.presentToast('Unsubscribed');
          this.isSubscribed = false;
          this.sub = null;
          localStorage.removeItem('pushSubscription');
          console.log("Unsubscription Payload: ", data);
        },
        error: (err) => console.error(err)
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
    const toast = await this.toastController.create({
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
