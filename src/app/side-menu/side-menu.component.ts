import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

	menu: Object = {};

	constructor(private dataService: DataService) {
		dataService.menu$.subscribe(menu => {
			console.log("SideMenuComponent: menu received - ", menu);
			this.menu = menu;
		});
	}

	ngOnInit() {
	}

}
