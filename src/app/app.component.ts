import { Component, OnInit, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { interval, timeout } from 'rxjs';
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
  apiData: any;
  private readonly publicKey = 'BCol311jRW4M59BwcFAMiESdjaTHaNGQTJ-kC88feFnLEJ6nC-2JFOBcMX-rLRIO8NaaXYwDRCLn1a_s4XgR384';

  constructor(
    private update: SwUpdate,
    private appRef: ApplicationRef,
    private swPush: SwPush
  ) {
    this.updateClient();
    this.checkUpdate();
  }

  ngOnInit() {
    this.pushSubscription();

    this.swPush.messages.subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err),
    });

    this.swPush.notificationClicks.subscribe({
      next: ({ action, notification }) => {
        console.log(action);
        console.log(notification);
        window.open(notification.data.url);
      },
      error: (err) => console.log(err),
    });
  }

  pushSubscription() {
    if (!this.swPush.isEnabled) {
      console.log('Notification is not enabled');
      return;
    }

    this.swPush
      .requestSubscription({
        serverPublicKey: this.publicKey,
      })
      .then((sub) => {
        // Make a post call to serve
        console.log(JSON.stringify(sub));
      })
      .catch((err) => console.log(err));
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
