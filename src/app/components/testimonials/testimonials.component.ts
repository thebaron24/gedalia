import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../../services/data.service';
import { PagesStoreService } from '../../services/pages-store.service';
import { TestimonialsStoreService } from '../../services/testimonials-store.service';
import { Pages } from '../../models/pages.model';
import { Testimonials } from '../../models/testimonials.model';
import { PageEvent } from '@angular/material/paginator';
import { Observable, Subject }    from 'rxjs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { PostFilterPipe } from '../../pipes/post-filter.pipe';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements OnInit, AfterViewInit, OnDestroy {

	subscriptions: any = {};
  totalTestimonials: number = 0;
  pageIndex: number = 1;
  pageEvent: PageEvent;

  constructor(public dataService: DataService,
              public pagesStoreService: PagesStoreService,
              public testimonialsStoreService: TestimonialsStoreService,
							private router: Router) {}

  ngOnInit(): void {}

	ngAfterViewInit(): void {}

	ngOnDestroy(): void {
    Object.keys(this.subscriptions).forEach(key => this.subscriptions[key].unsubscribe());
	}

	getTestimonialsPagination(event: PageEvent): PageEvent {
    this.dataService.getApiPosts('testimonials', ['&page=' + (event.pageIndex+1)]);
    return this.pageEvent;
  }

}
