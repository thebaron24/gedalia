import { Inject, Injectable, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, forkJoin}    from 'rxjs';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import configJson from '../assets/config.json';
import menuJson from '../assets/menu.json';
import pagesJson from '../assets/pages.json';
import postsJson from '../assets/posts.json';
import testimonialsJson from '../assets/testimonials.json';
//import { AsyncApiCallHelperService } from './async-api-call-helper.service';

declare const Zone: any;

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit, OnDestroy {

  DEBUG: boolean = false;

  // Observable sources
  private configSource = new Subject<Object>();
  private pagesSource  = new Subject<any[]>();
  private homeSource  = new Subject<any[]>();
  private pageSource  = new Subject<any[]>();
  private postsSource  = new Subject<any[]>();
  private menuSource  = new Subject<Object>();
  private totalPostsSource  = new Subject<number>();
  private testimonialsSource  = new Subject<any[]>();
  private totalTestimonialsSource  = new Subject<number>();

  // Observable streams
  config$ = this.configSource.asObservable();
  pages$  = this.pagesSource.asObservable();
  home$  = this.homeSource.asObservable();
  page$  = this.pageSource.asObservable();
  posts$  = this.postsSource.asObservable();
  menu$  = this.menuSource.asObservable();
  totalPosts$  = this.totalPostsSource.asObservable();
  testimonials$  = this.testimonialsSource.asObservable();
  totalTestimonials$  = this.totalTestimonialsSource.asObservable();

  config: Object = configJson;
  menu: Object = menuJson;
  pageMap: Object = {};
  currentPage: Array<any>;
  subscriptions: any = {};

  constructor(private http: HttpClient, private router: Router,@Inject(PLATFORM_ID) private platformId: Object/*, private asyncHelper: AsyncApiCallHelperService*/) {
    console.log("DataService: constructor firing");

    if (isPlatformBrowser(this.platformId)) {
      // Client only code.
      console.log("DataService: running in browser");
      //get config for initial setup
      this.getConfig().subscribe(response => {
        console.log("DataService: this.getConfig().subscribe firing");
        console.log("DataService: config loaded - ", response.body);
        this.config = response.body;
        this.configSource.next(response.body);

        //here we know the config is set - safe to initialize
        forkJoin(
          this.getMenu(),
          this.getPages(),
          this.getPosts(),
          this.getTestimonials()
        ).subscribe( response => { 
          console.log("DataService: forkjoin firing");
          this.setMenu(response[0]);
          this.setPages(response[1]);
          this.setPosts(response[2]);
          this.setTestimonials(response[3]);
        });

        //special case for home page
        // if(this.router.url === '/' || this.router.url === '/home'){
        //   this.getHome('home');
        // } else {
        //   this.getPage(this.router.url.replace('/',''));
        // }

      });
    }

    if (isPlatformServer(this.platformId)) {
      // Server only code.
      this.addToPageMap(pagesJson);
      this.addToPageMap(postsJson);

      console.log("DataService: running on server");
      this.setMenu({"body": menuJson});
      this.setPages({"body": pagesJson});
      this.setPosts({"body": postsJson, "total": postsJson.length});
      this.setTestimonials({"body": testimonialsJson, "total": testimonialsJson.length});

    }
    //get config fot initial setup
    //this.asyncHelper.doTask(this.getConfig()).subscribe(response => {
    //  console.log("DataService: asyncHelper finished", response);
    //});


    //to catch any router events and update component data
    this.subscriptions.routerEvents = this.router.events.subscribe((val) => {

      //to reset the loading bar so the user knows something is loading
      if(val instanceof NavigationStart) {
        console.log("PageComponent: router event NavigationStart - ", val);

        //special case for home page
        if(val.url === '/' || val.url === '/home') {
          //this.homeSource.next([]);
        } else {
          //this.pageSource.next(undefined);
        }
      }


      if(val instanceof NavigationEnd && Object.keys(this.config).length > 0) {
        console.log("DataService: router event NavigationEnd - ", val);
        //special case for home page
        if(val.url === '/' || val.url === '/home') {
          this.getHome('home');
        } else if(val.url === '/blog') {
          this.getPosts().subscribe(response => {this.setPosts(response)});
          this.getPage(val.url.replace('/',''));
        } else if(val.url === '/testimonials') {
          this.getTestimonials().subscribe(response => {this.setTestimonials(response)});
          this.getPage(val.url.replace('/',''));
        } else {
          this.getPage(val.url.replace('/',''));
        }
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

  setTestimonials(response: any) {
    let testimonials = response;
    console.log("DataService: all testimonials loaded - ", testimonials.body);
    //const testimonialsKeys = testimonials.headers.keys();
    this.totalTestimonialsSource.next((response['total']) ? response['total'] : Number(testimonials.headers.get('X-WP-Total')));
    //this.addToPageMap(response.body);
    this.testimonialsSource.next(testimonials.body);
  }

  setPosts(response: any) {
    let posts = response;
    console.log("DataService: all posts loaded - ", posts.body);
    //const keys = posts.headers.keys();
    this.totalPostsSource.next((response['total']) ? response['total'] : Number(posts.headers.get('X-WP-Total')));
    this.addToPageMap(posts.body);
    this.postsSource.next(posts.body);
  }

  setPages(response: any) {
    let pages = response;
    console.log("DataService: all pages loaded- ", pages.body);
    this.addToPageMap(pages.body);
    this.pagesSource.next(pages.body);
  }

  setMenu(response: any) {
    let menu = response;
    console.log("DataService: menu loaded - ", menu.body);
    this.menu = menu.body;
    this.menuSource.next(menu.body);
  }

  getJson(url): Observable<HttpResponse<any>> {
  	return this.http.get(url, { observe: 'response' });
  }

  getArray(url): Observable<HttpResponse<Array<any>>> {
  	return this.http.get<any[]>(url, { observe: 'response' });
  }

  getConfig(): Observable<HttpResponse<any>> {
    return this.getJson("/assets/config.json");
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

  getMenu(): Observable<HttpResponse<any>> {

    let thisUrl = this.DEBUG ? "/assets/menu.json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['menu'];

    return this.getJson(thisUrl);
  }

  getPages(): Observable<HttpResponse<Array<any>>> {

    let thisUrl = this.DEBUG ? "/assets/pages.json" : this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages'];

    return this.getArray(thisUrl);
  }

  getPosts(params?: string): Observable<HttpResponse<Array<any>>> {

    let thisUrl: string;

    if(this.DEBUG){
      thisUrl = "/assets/posts.json";
    } else {
      thisUrl = this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts'];

      thisUrl += params ? params : "&page=1";
    }

    console.log(thisUrl);
    
    return this.getArray(thisUrl);
    
  }

  getTestimonials(params?: string): Observable<HttpResponse<Array<any>>> {

    let thisUrl: string;

    if(this.DEBUG){
      thisUrl = "/assets/testimonials.json";
    } else {
      thisUrl = this.config['apiUrls']['apidomain'] + this.config['apiUrls']['testimonials'];

      thisUrl += params ? params : "&page=1";
    }
    
    return this.getArray(thisUrl);
    
  }

  addToPageMap(pages: Array<any>): void {
    for (let page of pages) {
      this.storePage(page['slug'], new Array(page));
    }

    console.log("DataService: current pageMap: ", this.pageMap);
  }

  filterArray(array: any[], test: string): any[] {
    let arrayspot = -1;

    if(!array) return [];

    for(let i = 0; i < array.length; i++) {
      if(array[i] && array[i]['slug'] && array[i]['slug'] === test){
        arrayspot = i;
      }
    }

    return (arrayspot !== -1) ? new Array(array[arrayspot]): [];
  }
}
