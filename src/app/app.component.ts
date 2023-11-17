import { Component, OnInit, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { interval, timeout } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { NotificationService } from './services/notification/notification.service';
import { io } from 'socket.io-client';

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
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {
    this.updateClient();
    this.checkUpdate();
    // this.socket = io('https://chh-push-notification-production.up.railway.app/api/v1/subscribe');
  }

  ngOnInit() {
    // this.socket.on('notification', (data: any) => {
    //   console.log(data);
      // this.notificationService.showNotification(data.title, data.body, data.url);
    // });

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
    //   const ws = new WebSocket(res.data.url);

    //   ws.onmessage = (e) => {
    //     const serverMessage = e.data;
    //     console.log(serverMessage);
    //     this.notificationService.showNotification(serverMessage.title, serverMessage.body);
    //   };
    //   // this.subscribeToNotification(res.publicKey);
    // }).catch((err) => console.log(err));
    
    // check if browser supports notification
    if('Notification' in window){
      console.log('Notification supported');

      // request permission for push notification
      Notification.requestPermission().then((status) => {
        console.log(status);
        if(status === 'granted'){
          console.log('Notification permission granted');
          this.http.get('http://localhost:8050/getSubscribe').subscribe({
            next: (res: any) => {
              console.log('getSubscribe', res);
              // Request subscription
              this.swPush.requestSubscription({
                serverPublicKey: res.publicKey,
              }).then((sub) => {
                console.log('requestSubscription', sub);
                this.http.post('http://localhost:8050/postSubscribe', {
                  // add app and userId to subscription
                  subscription: sub,
                  userId: '123456789123',
                  app: 'doki'
                }).subscribe({
                  next: (res: any) => {
                    console.log('postSubscribe', res);
                    // enable push api from service worker
                    navigator.serviceWorker.getRegistration().then((reg) => {
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
        } else {
          console.log('Notification permission denied');
        }
      });


    }

    // check if user is offline
    if(!navigator.onLine){
      localStorage.setItem('offline', 'true');
      this.toastController.create({
        message: 'You are offline',
        duration: 4000
      }).then((toast) => {
        toast.present();
      });
    } else {
      localStorage.removeItem('offline');
    }

    // check if push notification is enabled
    if (this.swPush.isEnabled) {
      // subscribe to push notification
      console.log('Push notification enabled');
    }


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
    
    this.swPush.messages.subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err),
    });

    // Listen to notification click
    this.swPush.notificationClicks.subscribe({
      next: ({ action, notification }) => {
        console.log(action);
        console.log(notification);
        window.open(notification.data.url);
      },
      error: (err) => console.log(err),
    });
  }

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
