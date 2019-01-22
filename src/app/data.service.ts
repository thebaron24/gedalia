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
  private homeSource  = new Subject<any[]>();
  private pageSource  = new Subject<any[]>();
  private postsSource  = new Subject<any[]>();
  private menuSource  = new Subject<Object>();
 
  // Observable string streams
  config$ = this.configSource.asObservable();
  pages$  = this.pagesSource.asObservable();
  home$  = this.homeSource.asObservable();
  page$  = this.pageSource.asObservable();
  posts$  = this.postsSource.asObservable();
  menu$  = this.menuSource.asObservable();

  config: Object = {};
  menu: Object = {};
  pageMap: Object = {};
  currentPage: Array<any>;
  subscriptions: any = {};

  constructor(private http: HttpClient, private router: Router) {
    console.log("DataService: constructor firing");
    //get config fot initial setup
    this.getConfig();

    //to catch any router events and update component data
    this.subscriptions.routerEvents = this.router.events.subscribe((val) => {
      if(val instanceof NavigationEnd && Object.keys(this.config).length > 0) {
        console.log("DataService: router event NavigationEnd - ", val);
        //special case for home page
        if(val.url === '/' || val.url === '/home') {
          this.getHome('home');
        } else {
          this.getPage(val.url.replace('/',''));
        }
      }
    });

    this.subscriptions.config = this.config$.subscribe(config => {
      //here we know the config is set - safe to initialize
      this.getMenu();

      //special case for home page
      if(this.router.url === '/' || this.router.url === '/home'){
        this.getHome('home');
      } else {
        this.getPage(this.router.url.replace('/',''));
      }
    });
  }

  ngOnInit() {
    console.log("DataService: OnInit firing");
  }

  ngOnDestroy() {
    console.log("DataService: OnDestroy firing");
    this.subscriptions.config.unsubscribe();
    this.subscriptions.routerEvents.unsubscribe();
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

  pageIsStored(page: string): boolean {
    return this.pageMap.hasOwnProperty(page) && this.pageMap[page].length;
  }

  storePage(page: string, pageArray: Array<any>): void {
    this.currentPage = pageArray;
    this.pageMap[page] = pageArray;
  }

  getStoredPage(page: string): Array<any> {
    return this.pageMap[page];
  }

  notifyPage(page: string): void {
    if(page === 'home'){
      this.homeSource.next(this.getStoredPage(page));
    } else {
      this.pageSource.next(this.getStoredPage(page));
    }
  }

  // getHome(page: string) {
  //   if(this.pageMap.hasOwnProperty(page) && this.pageMap[page].length){
  //     console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
  //     this.currentPage = this.pageMap[page];
  //     this.homeSource.next(this.pageMap[page]);
  //   } else {
  //     this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
  //       console.log("DataService: api call returned for " + page + " page: ", data);
  //       this.currentPage = data;
  //       this.pageMap[page] = data;
  //       this.homeSource.next(data);
  //     });
  //   }
  // }

  getHome(page: string) {
    if(this.pageIsStored(page)){
      console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
      this.currentPage = this.getStoredPage(page);
      this.notifyPage(page);
    } else {
      this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
        console.log("DataService: api call returned for " + page + " page: ", data);
        this.storePage(page, data);
        this.notifyPage(page);
      });
    }
  }


  getPage(page: string) {
    if(this.pageIsStored(page)){
      console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
      this.currentPage = this.getStoredPage(page);
      this.notifyPage(page);
    } else {
      this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
        console.log("DataService: api call returned for " + page + " page: ", data);

        if(data.length){
          this.storePage(page, data);
          this.notifyPage(page);
        } else {
          this.getPost(page);
        }

      });
    }
  }

  // getPage(page: string) {
  //   if(this.pageMap.hasOwnProperty(page) && this.pageMap[page].length){
  //     console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
  //     this.currentPage = this.pageMap[page];
  //     this.pageSource.next(this.pageMap[page]);
  //   } else {
  //     this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
  //       console.log("DataService: api call returned for " + page + " page: ", data);

  //       if(data.length){
  //         this.currentPage = data;
  //         this.pageMap[page] = data;
  //         this.pageSource.next(data);
  //       } else {
  //         this.getPost(page);
  //       }

  //     });
  //   }
  // }

  getPost(page: string) {
    if(this.pageIsStored(page)){
      console.log("DataService: " + page + " post already exists - using: ", this.getStoredPage(page));
      this.currentPage = this.getStoredPage(page);
      this.notifyPage(page);
    } else {
      this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
        console.log("DataService: api call returned for " + page + " post: ", data);
        this.storePage(page, data);
        this.notifyPage(page);
      });
    }
  }

  // getPost(page: string) {
  //   if(this.pageMap.hasOwnProperty(page) && this.pageMap[page].length){
  //     console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
  //     this.currentPage = this.pageMap[page];
  //     this.pageSource.next(this.pageMap[page]);
  //   } else {
  //     this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
  //       console.log("DataService: api call returned for " + page + " post: ", data);
  //       this.currentPage = data;
  //       this.pageMap[page] = data;
  //       this.pageSource.next(data);
  //     });
  //   }
  // }

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
