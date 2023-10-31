import { Component, OnInit, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { interval } from 'rxjs';

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
  private readonly publicKey = 'BFg3iN6s_6BoiQ3zPCCoSdwZawOceM_YMLGxtpTe3lX6uTY6k9mk2IAd4y_Ccx3aaaXMszM6uiXY-Rg0agdoWkM';

  constructor(
    private http: HttpClient,
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

  postSync(){
    const object = {
      title: 'foo',
      body: 'bar',
      userId: 1,
    };

    this.http.post('http://localhost:8050/data', object).subscribe({
      next: (data) => console.log(data),
      error: (err) => {
        console.log(err);
        this.backgroundSync();
      }
    });
  }

  backgroundSync(){
    navigator.serviceWorker.ready.then((swRegistration) => {
      swRegistration.sync.register('post-data');
    }).catch((err) => console.log(err));
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
      console.log('Not Enabled');
      return;
    }
    this.update.versionUpdates.subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err),
    });

    this.update.versionUpdates.subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err),
    });

  }

  checkUpdate() {
    this.appRef.isStable.subscribe({
      next: (data) => {
        if (data) {
          const timeInterval = interval(8 * 60 * 60 * 1000);

          timeInterval.subscribe({
            next: () => {
              this.update.checkForUpdate().then(() => console.log('Checked'));
              this.update.activateUpdate().then(() => document.location.reload());
            },
            error: (err) => console.log(err),
          });
        }
      },
      error: (err) => console.log(err),
    });
  }
}
