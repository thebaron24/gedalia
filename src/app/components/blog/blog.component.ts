import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../../services/data.service';
import { PagesStoreService } from '../../services/pages-store.service';
import { PostsStoreService } from '../../services/posts-store.service';
import { Pages } from '../../models/pages.model';
import { Posts } from '../../models/posts.model';
import { PostFilterPipe } from '../../pipes/post-filter.pipe';
import { PageEvent } from '@angular/material';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {

	subscriptions: any = {};
  totalPosts: number = 0;
  pageIndex: number = 1;
  pageEvent: PageEvent;
  searchSource  = new Subject<string>();
  searchTerm$ = this.searchSource.asObservable();
  searchValue = '';

  constructor(
    public dataService: DataService,
    public pagesStoreService: PagesStoreService,
    public postsStoreService: PostsStoreService,
		private router: Router) {}

  ngOnInit(): void {
    this.subscriptions.search = this.searchTerm$.pipe(debounceTime(400),distinctUntilChanged()).subscribe(searchTerms => {
      console.log("Searching..");
      this.searchValue = searchTerms;
      this.dataService.getApiPosts('posts', ['&search=' + this.searchValue]);
    });
  }

	ngAfterViewInit(): void {}

	ngOnDestroy(): void {
    Object.keys(this.subscriptions).forEach(key => this.subscriptions[key].unsubscribe());
	}

  clearSearch() {
    this.searchValue='';
    this.dataService.getApiPosts("posts");
  }

  getPostsPagination(event: PageEvent): PageEvent {
    this.dataService.getApiPosts('posts', ['&search=' + this.searchValue , '&page=' + (event.pageIndex+1)]);
    return this.pageEvent;
  }

  getImage(item: Object){

    let srcUrl = "/assets/placeholder-image.png"

    if(item['_embedded']['wp:featuredmedia'] && item['_embedded']['wp:featuredmedia'].length && item['_embedded']['wp:featuredmedia'][0]['media_details']['sizes']['medium_large']['source_url']){
      srcUrl = item['_embedded']['wp:featuredmedia'][0]['media_details']['sizes']['medium_large']['source_url'];
    }
    return srcUrl;
  }

}
