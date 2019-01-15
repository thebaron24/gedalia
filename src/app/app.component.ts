import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataService]
})
export class AppComponent {
  title = 'angular-wordpress';
  config: Object;
  pages: any[];
  posts: any[];

  constructor(private dataService: DataService) {
    dataService.config$.subscribe(config => {this.config = config});
    dataService.pages$.subscribe(pages => {this.pages = pages});
    dataService.posts$.subscribe(posts => {this.posts = posts});
  }

}
