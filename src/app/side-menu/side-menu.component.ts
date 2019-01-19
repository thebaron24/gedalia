import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit, OnDestroy {

	menu: Object = {};
	subscriptions: any = {};

	constructor(private dataService: DataService) {
		console.log("SideMenuComponent: constructor firing");
		this.subscriptions.menu = dataService.menu$.subscribe(menu => {
			console.log("SideMenuComponent: menu received - ", menu);
			this.menu = menu;
		});
	}

	ngOnInit(): void {
		console.log("SideMenuComponent: OnInit firing");
	}

	ngOnDestroy(): void {
		console.log("SideMenuComponent: OnDestroy firing");
		this.subscriptions.menu.unsubscribe();
	}

}
