import { Injectable, OnInit, OnDestroy  } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject }    from 'rxjs';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit, OnDestroy {

  DEBUG: boolean = false;

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

      //to reset the loading bar so the user knows something is loading
      if(val instanceof NavigationStart) {
        console.log("PageComponent: router event NavigationStart - ", val);

        //special case for home page
        if(val.url === '/' || val.url === '/home') {
          this.homeSource.next([]);
        } else {
          this.pageSource.next(undefined);
        }
      }


      if(val instanceof NavigationEnd && Object.keys(this.config).length > 0) {
        console.log("DataService: router event NavigationEnd - ", val);
        //special case for home page
        if(val.url === '/' || val.url === '/home') {
          this.getHome('home');
        } else if(val.url === '/blog') {
          this.getPosts();
          this.getPage(val.url.replace('/',''));
        } else {
          this.getPage(val.url.replace('/',''));
        }
      }
    });

    this.subscriptions.config = this.config$.subscribe(config => {
      //here we know the config is set - safe to initialize
      this.getMenu();
      this.getPosts();
      //special case for home page
      if(this.router.url === '/' || this.router.url === '/home'){
        this.getHome('home');
      } else {
        this.getPage(this.router.url.replace('/',''));
      }
    });
  }

  ngOnInit(): void {
    console.log("DataService: OnInit firing");
  }

  ngOnDestroy(): void {
    console.log("DataService: OnDestroy firing");
    this.subscriptions.config.unsubscribe();
    this.subscriptions.routerEvents.unsubscribe();
  }

  getJson(url): Observable<HttpResponse<any>> {
  	return this.http.get(url, { observe: 'response' });
	}

	getArray(url): Observable<HttpResponse<Array<any>>> {
  	return this.http.get<any[]>(url, { observe: 'response' });
	}

  getConfig(): void {
    this.getJson("/assets/config.json").subscribe(response => {
      console.log("DataService: config loaded - ", response.body);
      this.config = response.body;
      this.configSource.next(response.body);
    });
  }

  pageIsStored(page: string): boolean {
    console.log("DataService: "+page+" pageIsStored = ", this.pageMap.hasOwnProperty(page));
    return this.pageMap.hasOwnProperty(page);
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

  getHome(page: string): void {

    let thisUrl = this.DEBUG ? "/assets/"+page+".json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page;

    if(this.pageIsStored(page)){
      console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
      this.currentPage = this.getStoredPage(page);
      this.notifyPage(page);
    } else {
      this.getArray(thisUrl).subscribe(response => {
        console.log("DataService: api call returned for " + page + " page: ", response.body);
        this.storePage(page, response.body);
        this.notifyPage(page);
      });
    }
  }


  getPage(page: string): void {

    let thisUrl = this.DEBUG ? "/assets/"+page+".json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page;

    if(this.pageIsStored(page)){
      console.log("DataService: " + page + " page already exists - using: ", this.pageMap[page]);
      this.currentPage = this.getStoredPage(page);
      this.notifyPage(page);
    } else {
      this.getArray(thisUrl).subscribe(response => {
        console.log("DataService: api call returned for " + page + " page: ", response.body);

        if(response.body.length){
          this.storePage(page, response.body);
          this.notifyPage(page);
        } else {
          this.getPost(page);
        }

      });
    }
  }

  getPost(page: string): void {

    let thisUrl = this.DEBUG ? "/assets/"+page+".json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts']+this.config['apiUrls']['param']['slug']+page;



    if(this.pageIsStored(page)){
      console.log("DataService: " + page + " post already exists - using: ", this.getStoredPage(page));
      this.currentPage = this.getStoredPage(page);
      this.notifyPage(page);
    } else {
      this.getArray(thisUrl).subscribe(response => {
        console.log("DataService: api call returned for " + page + " post: ", response.body);
        this.storePage(page, response.body);
        this.notifyPage(page);
      });
    }
  }

  getMenu(): void {

    let thisUrl = this.DEBUG ? "/assets/menu.json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['menu'];

    this.getJson(thisUrl).subscribe(response => {
      console.log("DataService: menu loaded - ", response.body);
      this.menu = response.body;
      this.menuSource.next(response.body);
    });
  }

  getPages(): void {

    let thisUrl = this.DEBUG ? "/assets/pages.json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages'];

    this.getArray(thisUrl).subscribe(response => {
      this.addToPageMap(response.body);
      console.log("DataService: api call for all pages - ", response.body);
      this.pagesSource.next(response.body);
    });
  }

  getPosts(): void {

    let thisUrl = this.DEBUG ? "/assets/posts.json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts'];
    
    this.getArray(thisUrl).subscribe(response => {
      this.addToPageMap(response.body);
      console.log("DataService: api call for all posts - ", response.body);
      this.postsSource.next(response.body);
    });
    
  }

  addToPageMap(pages: Array<any>): void {
    for (let page of pages) {
      this.storePage(page['slug'], new Array(page));
    }

    console.log("DataService: current pageMap: ", this.pageMap);
  }
}
