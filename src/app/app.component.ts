import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-universal';

  pages;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // ...
    this.dataService.getPages();
  }

}
