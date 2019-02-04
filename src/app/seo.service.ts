import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService implements OnInit, OnDestroy {

	subscriptions: any = {};

  constructor(private titleService: Title,
  						private metaService: Meta) {
  	console.log("SeoService: constructor firing");
  }

  ngOnInit(): void {
    console.log("SeoService: OnInit firing");
  }

  ngOnDestroy(): void {
    console.log("SeoService: OnDestroy firing");
    this.subscriptions.config.unsubscribe();
    this.subscriptions.routerEvents.unsubscribe();
  }

  handleSeo(page: Array<any>){
  	let pageObject = page[0];
  	this.setTitle(pageObject['title']['rendered']);
  }

  setTitle( newTitle: string): void {
    this.titleService.setTitle( newTitle );
  }
}
