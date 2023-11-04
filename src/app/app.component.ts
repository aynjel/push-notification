import { Component, OnInit, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { interval, timeout } from 'rxjs';
import { ToastController } from '@ionic/angular';
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
  // sample public key
  private readonly publicKey = 'BCol311jRW4M59BwcFAMiESdjaTHaNGQTJ-kC88feFnLEJ6nC-2JFOBcMX-rLRIO8NaaXYwDRCLn1a_s4XgR384';

  constructor(
    private update: SwUpdate,
    private appRef: ApplicationRef,
    private swPush: SwPush,
    private toastController: ToastController,
    private notificationService: NotificationService
  ) {
    this.updateClient();
    this.checkUpdate();
  }

  ngOnInit() {
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

    if (!this.swPush.isEnabled) {
      console.log('Notification is not enabled');
      return;
    }

    // subscribe to push notification
    this.notificationService.subscribeToNotification(this.publicKey);

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
