import { Component, OnInit, ApplicationRef } from '@angular/core';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { interval } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';
import { NotificationService } from './services/notification/notification.service';

declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
    };
  }
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private socket: any;
  public data: any;

  constructor(
    private update: SwUpdate,
    private appRef: ApplicationRef,
    private swPush: SwPush,
    private toastController: ToastController,
    private alertController: AlertController,
    private notificationService: NotificationService,
  ) {
    this.updateClient();
    this.checkUpdate();
  }

  ngOnInit() {
    
    // check if browser supports notification
    // if('Notification' in window){
    //   console.log('Notification supported');

    //   if (Notification.permission !== "granted") {
    //     // popup to ask for notification permission
    //     this.alertController.create({
    //       header: "Allow Notification",
    //       message: "Do you want to allow notification?",
    //       buttons: [
    //         {
    //           text: "No",
    //           role: "cancel",
    //           handler: () => {
    //             console.log("Notification permission denied");
    //           },
    //         },
    //         {
    //           text: "Yes",
    //           handler: () => {
    //             Notification.requestPermission().then((permission) => {
    //               if (permission === "granted") {
    //                 this.toastController.create({
    //                   message: 'Notification permission granted',
    //                   duration: 4000
    //                 }).then((toast) => {
    //                   toast.present();
    //                 });
    //               } else {
    //                 this.toastController.create({
    //                   message: 'Notification permission denied',
    //                   duration: 4000
    //                 }).then((toast) => {
    //                   toast.present();
    //                 });
    //               }
    //             });
    //           },
    //         },
    //       ],
    //     });
    //   }else{
    //     this.subscribeToNotifications();
    //   }
    // }

    // check if user is offline
    // if(!navigator.onLine){
    //   localStorage.setItem('offline', 'true');
    //   this.toastController.create({
    //     message: 'You are offline',
    //     duration: 4000
    //   }).then((toast) => {
    //     toast.present();
    //   });
    // } else {
    //   localStorage.removeItem('offline');
    // }

    // check if push notification is enabled
    // if (this.swPush.isEnabled) {
    //   // subscribe to push notification
    //   console.log('Push notification enabled');
    // }


    // // fetch push notification from api
    // const res = fetch('https://chh-push-notification-production.up.railway.app/api/v1/subscribe', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     userId: '123456789123',
    //     app: 'doki',
    //   }),
    // });
    // res.then((res) => res.json()).then((res) => {
    //   console.log(res);
      
    // }).catch((err) => console.log(err));

    // Listen to push notification
    
    // this.swPush.messages.subscribe({
    //   next: (data) => console.log(data),
    //   error: (err) => console.log(err),
    // });

    // Listen to notification click
    // this.swPush.notificationClicks.subscribe({
    //   next: ({ action, notification }) => {
    //     console.log(action);
    //     console.log(notification);
    //     window.open(notification.data.url);
    //   },
    //   error: (err) => console.log(err),
    // });
  }

  // subscribeToNotifications(): void {
  //   this.notificationService.checkSubscription().then((res) => {
  //     if (!res) {
  //       this.notificationService.getPublicKey().subscribe({
  //         next: (res: any) => {
  //           const publicKey = res.data.publicKey;
  //           this.notificationService.requestSubscription(publicKey).then((sub) => {
  //             this.notificationService.subscribeNotification(sub).subscribe({
  //               next: (res) => {
  //                 console.log("Subscription Success", res);
  //               },
  //               error: (err) => {
  //                 console.log("Error Subscription", err);
  //               }
  //             });
  //           });
  //         },
  //         error: (err) => {
  //           this.toastController.create({
  //             message: 'Error getting public key',
  //             duration: 4000
  //           }).then((toast) => {
  //             toast.present();
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

  updateClient() {
    if (!this.update.isEnabled) {
      console.log('Update is not enabled');
      return;
    }

    this.update.versionUpdates.subscribe({
      next: (event) => {
        if (event.type === 'NO_NEW_VERSION_DETECTED') console.log('No new version detected');

        if (event.type === 'VERSION_DETECTED') {
          console.log('Version detected... Checking for updates');
          if(confirm('New version available. Load New Version?')){
            this.update.activateUpdate().then(() => {
              console.log('App updated successfully');
              location.reload();
            }).catch((err) => console.log(err));
          }
        }
      },
      error: (err) => console.log(err),
    });
  }

  checkUpdate() {
    this.appRef.isStable.subscribe({
      next: (isStable) => {
        if (isStable) {
          const timeInterval = interval(8 * 60 * 60 * 1000); // 8 hours
          timeInterval.subscribe({
            next: () => {
              this.update.checkForUpdate().then(() => console.log('Checking for updates'));
            },
            error: (err) => console.log(err),
          });
        }
      },
      error: (err) => console.log(err),
    });
  }
}