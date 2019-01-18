import { Injectable, OnInit, OnDestroy  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject }    from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit, OnDestroy {

  // Observable string sources
  private configSource = new Subject<Object>();
  private pagesSource  = new Subject<any[]>();
  private pageSource  = new Subject<any[]>();
  private postsSource  = new Subject<any[]>();
  private menuSource  = new Subject<Object>();
 
  // Observable string streams
  config$ = this.configSource.asObservable();
  pages$  = this.pagesSource.asObservable();
  page$  = this.pageSource.asObservable();
  posts$  = this.postsSource.asObservable();
  menu$  = this.menuSource.asObservable();

  config: Object = {};
  menu: Object = {};
  pageMap: Object = {};
  currentPage: Array<any>;

  constructor(private http: HttpClient, private router: Router) {
    console.log("DataService: constructor firing");
    //get config fot initial setup
    this.getConfig();

    //to catch any router events and update component data
    this.router.events.subscribe((val) => {
      if(val instanceof NavigationEnd && Object.keys(this.config).length > 0) {
        console.log("DataService: router event NavigationEnd - ", val);
        this.getPage(val.url === '/' || val.url === '/home' ? 'home' : val.url.replace('/',''));
      }
    });

    this.config$.subscribe(config => {
      //here we know the config is set - safe to initialize
      this.getMenu();
      this.getPage(this.router.url === '/' || this.router.url === '/home' ? 'home' : this.router.url.replace('/',''));
    });
  }

  ngOnInit() {
    console.log("DataService: OnInit firing");
  }

  ngOnDestroy() {
    console.log("DataService: OnDestroy firing");
  }

  getJson(url) {
  	return this.http.get(url);
	}

	getArray(url) {
  	return this.http.get<any[]>(url);
	}

  getConfig() {
    this.getJson("/assets/config.json").subscribe(data => {
      console.log("DataService: config loaded - ", data);
      this.config = data;
      this.configSource.next(data);
    });
  }

  getPage(page: string) {
    if(this.pageMap.hasOwnProperty(page) && this.pageMap[page].length){
      console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
      this.currentPage = this.pageMap[page];
      this.pageSource.next(this.pageMap[page]);
    } else {
      this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
        console.log("DataService: api call returned for " + page + " page: ", data);
        this.currentPage = data;
        this.pageMap[page] = data;
        this.pageSource.next(data);
      });
    }
  }

  getMenu() {
    this.getJson(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['menu']).subscribe(data => {
      console.log("DataService: menu loaded - ", data);
      this.menu = data;
      this.menuSource.next(data);
    });
  }

  getPages() {
    this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']).subscribe(data => {
      console.log("DataService: api call for all pages - ", data);
      this.pagesSource.next(data);
    });
  }

  getPosts() {
    this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts']).subscribe(data => {
      console.log("DataService: api call for all posts - ", data);
      this.postsSource.next(data);
    });
  }
}
