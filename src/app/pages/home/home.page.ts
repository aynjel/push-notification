import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IndexDbService } from 'src/app/services/indexDb/index-db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  numbers: number[] = [];

  constructor(
    private http: HttpClient,
    private indexDB: IndexDbService
  ) {
    for (let i = 0; i < 10; i++) {
      this.numbers.push(i);
    }
  }

  ngOnInit() {
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
