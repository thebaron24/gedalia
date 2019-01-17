import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DataService]
})
export class HomeComponent implements OnInit {

	page: any[] = [];

	constructor(private dataService: DataService) {
		dataService.page$.subscribe(page => {
			console.log("page received:", page)
			this.page.push(page[0]);
		});
		dataService.config$.subscribe(config => {
      console.log("config is loaded");
      dataService.getPage('home');
    });
	}

	ngOnInit() {}

}
