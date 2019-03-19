import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { PagesStoreService } from '../../services/pages-store.service';
import { PostFilterPipe } from '../../pipes/post-filter.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

	constructor(
		public dataService: DataService,
		public pagesStoreService: PagesStoreService,
		private seoService: SeoService) {}

	ngOnInit(): void {}

	ngAfterViewInit(): void {}

	ngOnDestroy(): void {}

	getImage(item: Object){
    let srcUrl = ""
    if(item && item['_embedded'] && item['_embedded']['wp:featuredmedia'] && item['_embedded']['wp:featuredmedia'].length && item['_embedded']['wp:featuredmedia'][0]['media_details']['sizes']['medium_large']['source_url']){
      srcUrl = item['_embedded']['wp:featuredmedia'][0]['media_details']['sizes']['full']['source_url'];
    }
    return srcUrl;
  }
}
