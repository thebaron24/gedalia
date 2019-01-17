import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  providers: [DataService]
})
export class SideMenuComponent implements OnInit {

	menu: Object;

	constructor(private dataService: DataService) {
		dataService.menu$.subscribe(menu => {
			if(!this.menu && Object.keys(this.menu).length){
				console.log("using new menu received: ", menu);
				this.menu = menu;
			} else {
				console.log("menu exists - using: ", this.menu);
				this.menu = menu;
			}
		});
	}

	ngOnInit() {
	}

}
