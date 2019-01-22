import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { SafeHtmlPipe } from '../safe-html.pipe';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {

	page: any[];
	subscriptions: any = {};

  constructor(private dataService: DataService,
							private router: Router) {
  	console.log("BlogComponent: Constructor firing");
    this.subscriptions.page = this.dataService.page$.subscribe(page => {
      console.log("BlogComponent: page received - ", page);
      if(page.length) this.page = page;
      else this.router.navigateByUrl('/404');
    });

    //to reset the loading bar so the user knows something is loading
    this.subscriptions.routerEvents = this.router.events.subscribe((val) => {
      if(val instanceof NavigationStart) {
        console.log("BlogComponent: router event NavigationStart - ", val);
        this.page = [];
      }
    });
  }

  ngOnInit(): void {
		console.log("BlogComponent: OnInit firing");
	}

	ngAfterViewInit() {
		console.log("BlogComponent: AfterViewInit firing");
	}

	ngOnDestroy(): void {
		console.log("BlogComponent: OnDestroy firing");
		this.subscriptions.page.unsubscribe();
		this.subscriptions.routerEvents.unsubscribe();
	}

}
