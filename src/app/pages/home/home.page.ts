import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
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

  constructor(
    private notification: NotificationService,
    private swPush: SwPush
  ) {
    for (let i = 0; i < 10; i++) {
      this.numbers.push(i);
    }
  }

  ngOnInit() {
  }

  async subscribeToNotification() {
    this.notification.getPublicKey().subscribe({
      next: (res: any) => {
        console.log('Get Public Key from Server', res);
        // Request subscription
        this.swPush.requestSubscription({
          serverPublicKey: res.publicKey,
        }).then((sub) => {
          console.log('Success Subscription', sub);
          // Send subscription to server
          this.notification.subscribeToNotification(sub).subscribe({
            next: (res) => console.log(res),
            error: (err) => console.log(err),
          });
        }).catch((err) => console.log(err));
      },
      error: (err) => console.log(err),
    });
  }

  async unSubscribeToNotification() {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.pushManager.getSubscription().then((sub) => {
          if (sub) {
            sub.unsubscribe().then((success) => {
              console.log('Unsubscribe Success', success);
            }).catch((err) => console.log(err));
          }
        });
      });
    }else{
      console.log('Notification permission not granted');
    }
  }

  async allowNotification() {
    this.notification.allowNotification();
  }

  async checkSubscription() {
    this.swPush.subscription.subscribe((sub) => {
      console.log('Subscription', sub);
    });
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
