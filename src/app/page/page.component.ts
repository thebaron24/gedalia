import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router, NavigationStart } from '@angular/router';
import { SafeHtmlPipe } from '../safe-html.pipe';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, AfterViewInit, OnDestroy {

	page: any[];
  subscriptions: any = {};

  constructor(private dataService: DataService,
  						private router: Router) {
    console.log("PageComponent: Constructor firing");

    this.subscriptions.page = this.dataService.page$.subscribe(page => {
      console.log("PageComponent: page received - ", page);
      if(page.length) this.page = page;
      else this.router.navigateByUrl('/404');
    });

    //to reset the loading bar so the user knows something is loading
    // this.subscriptions.routerEvents = this.router.events.subscribe((val) => {
    //   if(val instanceof NavigationStart) {
    //     console.log("PageComponent: router event NavigationStart - ", val);
    //     this.page = [];
    //   }
    // });
  }

  ngOnInit(): void {
    console.log("PageComponent: OnInit firing");
  }

  ngAfterViewInit(): void {
    console.log("PageComponent: AfterViewInit firing");
  }

  ngOnDestroy(): void {
    console.log("PageComponent: OnDestroy firing");
    this.subscriptions.page.unsubscribe();
    // this.subscriptions.routerEvents.unsubscribe();
  }

}
