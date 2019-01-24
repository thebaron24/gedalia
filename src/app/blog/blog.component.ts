import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { SafeHtmlPipe } from '../safe-html.pipe';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {

	page: any[];
  posts: any[];
	subscriptions: any = {};

  constructor(private dataService: DataService,
							private router: Router) {
  	console.log("BlogComponent: Constructor firing");

    this.subscriptions.config = this.dataService.config$.subscribe(config => {
      console.log("BlogComponent: config received - ", config);
      this.dataService.getPosts();
    });

    this.subscriptions.page = this.dataService.page$.subscribe(page => {
      console.log("BlogComponent: page received - ", page);
      if(page.length) this.page = page;
      else this.router.navigateByUrl('/404');
    });

    this.subscriptions.posts = this.dataService.posts$.subscribe(posts => {
      console.log("BlogComponent: posts received - ", posts);
      if(posts.length) this.posts = posts;
    });

    //to reset the loading bar so the user knows something is loading
    this.subscriptions.routerEvents = this.router.events.subscribe((val) => {
      if(val instanceof NavigationStart) {
        console.log("BlogComponent: router event NavigationStart - ", val);
        this.page = [];
      }
    });
  }

  ngOnInit(): void {
		console.log("BlogComponent: OnInit firing");
    if(this.posts.length === 0){
      this.dataService.getPosts();
    }
	}

	ngAfterViewInit() {
		console.log("BlogComponent: AfterViewInit firing");
	}

	ngOnDestroy(): void {
		console.log("BlogComponent: OnDestroy firing");
    this.subscriptions.config.unsubscribe();
		this.subscriptions.page.unsubscribe();
    this.subscriptions.posts.unsubscribe();
		this.subscriptions.routerEvents.unsubscribe();
	}

}
