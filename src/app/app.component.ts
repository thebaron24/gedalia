import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-universal';

  pages;

  constructor(private dataService: DataService) {

  	//dataService.getPages().subscribe(data => {
  	//	console.log(data);
  	//	this.pages = data;
  	//});

    dataService.getPages();
  }

}
