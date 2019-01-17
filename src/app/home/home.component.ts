import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DataService]
})
export class HomeComponent implements OnInit {

	page: any[];

	constructor(private dataService: DataService) {
		dataService.page$.subscribe(page => {
			console.log("page received:", page)
			this.page = page;
		});
		dataService.config$.subscribe(config => {
      console.log("config was received from service - fetching home");
      dataService.getPage('home');
    });
	}

	ngOnInit() {}

}
