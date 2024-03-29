import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { PagesStoreService } from '../../services/pages-store.service';
import { PostsStoreService } from '../../services/posts-store.service';
import { Router, NavigationStart } from '@angular/router';
import { PostFilterPipe } from '../../pipes/post-filter.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnDestroy {

  subscriptions: any = {};

  constructor(public dataService: DataService, private router: Router, public pagesStoreService: PagesStoreService,
              public postsStoreService: PostsStoreService
    ) {}

  ngOnDestroy(): void {
    Object.keys(this.subscriptions).forEach(key => this.subscriptions[key].unsubscribe());
  }

  getCurrentUrl(): string {
    return this.router.url.replace('/', '');
  }

  getImage(item: Object): string {
    let srcUrl = '';;

    // tslint:disable-next-line:max-line-length
    if (item && item['_embedded'] && item['_embedded']['wp:featuredmedia'] && item['_embedded']['wp:featuredmedia'].length && item['_embedded']['wp:featuredmedia'][0]['media_details']['sizes']['medium_large']['source_url']){
      srcUrl = item['_embedded']['wp:featuredmedia'][0]['media_details']['sizes']['full']['source_url'];
    }
    return srcUrl;
  }

}
