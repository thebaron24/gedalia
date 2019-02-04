import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { SeoService } from '../seo.service';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { PageEvent } from '@angular/material';
//import { Observable, Subject }    from 'rxjs';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements OnInit, AfterViewInit, OnDestroy {

	page: any[];
  testimonials: any[] = [];
	subscriptions: any = {};
  totalTestimonials: number = 0;
  pageIndex: number = 1;
  pageEvent: PageEvent;

  constructor(private dataService: DataService,
              private seoService: SeoService,
							private router: Router) {
  	console.log("TestimonialsComponent: constructor firing");

  	this.subscriptions.page = this.dataService.page$.subscribe(page => {
      console.log("TestimonialsComponent: page received - ", page);
      if(page && page.length) this.page = page, this.seoService.handleSeo(page);
      else this.page = [];
      //else this.router.navigateByUrl('/404');
    });

    this.subscriptions.testimonials = this.dataService.testimonials$.subscribe(testimonials => {
      console.log("TestimonialsComponent: testimonials received - ", testimonials);
      if(testimonials.length) this.testimonials = testimonials;
    });

    this.subscriptions.totalTestimonials = this.dataService.totalTestimonials$.subscribe(totalTestimonials => {
      console.log("TestimonialsComponent: totalTestimonials received - ", totalTestimonials);
      if(totalTestimonials) this.totalTestimonials = totalTestimonials;
    });
  }

  ngOnInit(): void {
		console.log("TestimonialsComponent: OnInit firing");
	}

	ngAfterViewInit(): void {
		console.log("TestimonialsComponent: AfterViewInit firing");
	}

	ngOnDestroy(): void {
		console.log("TestimonialsComponent: OnDestroy firing");
		this.subscriptions.page.unsubscribe();
    this.subscriptions.testimonials.unsubscribe();
    this.subscriptions.totalTestimonials.unsubscribe();
	}

	getTestimonialsPagination(event: PageEvent): PageEvent {
    console.log("TestimonialsComponent: PageEvent", event);
    this.testimonials = [];
    this.dataService.getTestimonials("&page=" + (event.pageIndex+1));

    return this.pageEvent;
  }

}
