import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DataService } from '../data.service';
import { SeoService } from '../seo.service';
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
              private seoService: SeoService,
  						private router: Router) {
    console.log("PageComponent: Constructor firing");

    this.subscriptions.page = this.dataService.page$.subscribe(page => {
      console.log("PageComponent: page received - ", page);
      if(page && page.length) this.page = page, this.seoService.handleSeo(page);
      else if(page && page.length === 0) this.router.navigateByUrl('/404');
      else this.page = [];
    });
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
  }

}
