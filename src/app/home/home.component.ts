import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { SeoService } from '../seo.service';
import { SafeHtmlPipe } from '../safe-html.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
	//page: any[] = pagesJson.filter( item => { if(item.slug === 'home') return item } );
	page: any[];
	subscriptions: any = {};
	//@ViewChild('canvas') myCanvas: ElementRef;
	//public context: CanvasRenderingContext2D;

	constructor(private dataService: DataService,
							private seoService: SeoService,
							private router: Router,
							private renderer: Renderer2) {
		console.log("HomeComponent: Constructor firing");

		this.subscriptions.home = this.dataService.home$.subscribe(page => {
			console.log("HomeComponent: page received - ", page)
			this.page = page, this.seoService.handleSeo(this.page);
		});
	}

	ngOnInit(): void {
		console.log("HomeComponent: OnInit firing");
	}

	ngAfterViewInit(): void {
		console.log("HomeComponent: AfterViewInit firing");
		//this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
		//this.renderer.addClass(this.myCanvas.nativeElement, 'my-class');
	}

	ngOnDestroy(): void {
		console.log("HomeComponent: OnDestroy firing");
		this.subscriptions.home.unsubscribe();
	}
}
