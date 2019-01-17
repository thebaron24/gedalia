import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  providers: [DataService]
})
export class SideMenuComponent implements OnInit {

	menu: Object = {};

	constructor(private dataService: DataService) {
		dataService.menu$.subscribe(menu => {
			if(Object.keys(this.menu).length) {
				console.log("side menu component: menu exists - not updating: ", this.menu);
				//this.menu = menu;
			} else {
				console.log("side menu component: using new menu received: ", menu);
				this.menu = menu;
			}
		});
	}

	ngOnInit() {
	}

}
