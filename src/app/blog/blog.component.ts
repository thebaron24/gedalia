import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {

	page: any[];
  posts: any[] = [];
	subscriptions: any = {};
  totalPosts: number = 0;
  pageIndex: number = 1;
  pageEvent: PageEvent;

  constructor(private dataService: DataService,
							private router: Router) {
  	console.log("BlogComponent: Constructor firing");

    this.subscriptions.page = this.dataService.page$.subscribe(page => {
      console.log("BlogComponent: page received - ", page);
      if(page && page.length) this.page = page;
      else this.page = [];
      //else this.router.navigateByUrl('/404');
    });

    this.subscriptions.posts = this.dataService.posts$.subscribe(posts => {
      console.log("BlogComponent: posts received - ", posts);
      if(posts.length) this.posts = posts;
    });

    this.subscriptions.totalPosts = this.dataService.totalPosts$.subscribe(totalPosts => {
      console.log("BlogComponent: totalPosts received - ", totalPosts);
      if(totalPosts) this.totalPosts = totalPosts;
    });
  }

  ngOnInit(): void {
		console.log("BlogComponent: OnInit firing");
    // if(this.posts && this.posts.length === 0){
    //   this.dataService.getPosts();
    // }
	}

	ngAfterViewInit(): void {
		console.log("BlogComponent: AfterViewInit firing");
	}

	ngOnDestroy(): void {
		console.log("BlogComponent: OnDestroy firing");
		this.subscriptions.page.unsubscribe();
    this.subscriptions.posts.unsubscribe();
    this.subscriptions.totalPosts.unsubscribe();
	}

  getPostsPagination(event: PageEvent): PageEvent {
    console.log("BlogComponent: PageEvent", event);
    this.posts = [];
    this.dataService.getPosts("&page=" + (event.pageIndex+1));

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
