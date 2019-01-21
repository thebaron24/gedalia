import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { SafeHtmlPipe } from '../safe-html.pipe'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
	page: any[];
	subscriptions: any = {};

	constructor(private dataService: DataService,
							private router: Router) {
		console.log("HomeComponent: Constructor firing");
		this.subscriptions.home = this.dataService.home$.subscribe(page => {
			console.log("HomeComponent: page received - ", page)
			this.page = page;
		});

		//to reset the loading bar so the user knows something is loading
    this.subscriptions.routerEvents = this.router.events.subscribe((val) => {
      if(val instanceof NavigationStart) {
        console.log("DataService: router event NavigationStart - ", val);
        this.page = [];
      }
    });
	}

	ngOnInit(): void {
		console.log("HomeComponent: OnInit firing");
	}

	ngAfterViewInit() {
		console.log("HomeComponent: AfterViewInit firing");
	}

	ngOnDestroy(): void {
		console.log("HomeComponent: OnDestroy firing");
		this.subscriptions.home.unsubscribe();
		this.subscriptions.routerEvents.unsubscribe();
	}

}
