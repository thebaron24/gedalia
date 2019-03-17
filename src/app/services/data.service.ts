import { Inject, Injectable, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, forkJoin}    from 'rxjs';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Pages } from '../models/pages.model';
import { Posts } from '../models/posts.model';
import { Menus } from '../models/menus.model';
import { Testimonials } from '../models/testimonials.model';
import { TestimonialsStoreService } from './testimonials-store.service';
import { PagesStoreService } from './pages-store.service';
import { PostsStoreService } from './posts-store.service';
import { MenusStoreService } from './menus-store.service';

import * as _ from 'lodash';

import configJson from '../../assets/config.json';
import menuJson from '../../assets/menu.json';
import menusJson from '../../assets/menus.json';
import pagesJson from '../../assets/pages.json';
import postsJson from '../../assets/posts.json';
import testimonialsJson from '../../assets/testimonials.json';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit, OnDestroy {

  // Observable sources
  private configSource = new Subject<Object>();

  // Observable streams
  config$ = this.configSource.asObservable();

  config: Object = configJson;

  //----------------------------------------------
  subscriptions: any = {};

  constructor(private http: HttpClient,
              private router: Router,
              private testimonialsStoreService: TestimonialsStoreService,
              private pagesStoreService: PagesStoreService,
              private postsStoreService: PostsStoreService,
              private menusStoreService: MenusStoreService,
              @Inject(PLATFORM_ID) private platformId: Object) {

    // if (isPlatformBrowser(this.platformId)) {
    //   // Client only code.
    //   console.log("DataService: running in browser");
    // }
    // if (isPlatformServer(this.platformId)) {
    //   // Server only code.
    //   console.log("DataService: running on server");
    // }
    // this.getConfig().subscribe(response => {
    //   console.log("DataService: this.getConfig().subscribe firing");
      this.setConfig({"body": configJson});
      this.getApiPosts('menus');
      this.getApiPosts('pages');
      this.getApiPosts('posts');
      this.getApiPosts('testimonials');
    //});
    //to catch any router events and update component data
    this.subscriptions.routerEvents = this.router.events.subscribe((val) => {
      //to reset the loading bar so the user knows something is loading
      if(val instanceof NavigationStart) {
        console.log("PageComponent: router event NavigationStart - ", val);
      }
      if(val instanceof NavigationEnd && Object.keys(this.config).length > 0) {
        console.log("DataService: router event NavigationEnd - ", val);


        this.getApiPosts('pages', ['&slug=' + val.url.replace('/', '')])
        this.getApiPosts('posts', ['&slug=' + val.url.replace('/', '')])
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    Object.keys(this.subscriptions).forEach(key => this.subscriptions[key].unsubscribe());
  }

  sendToStore(postType: string, state: Pages | Posts | Menus | Testimonials) {

    if(postType === 'pages') {
      this.pagesStoreService.addPages(state.items, state.total);
    } else if (postType === 'posts') {
      this.postsStoreService.addPosts(state.items, state.total);
    } else if (postType === 'menus') {
      this.menusStoreService.addMenus(state.items, state.total);
    } else if (postType === 'testimonials') {
      this.testimonialsStoreService.addTestimonials(state.items, state.total);
    }

  }

  setConfig(response: any) {
    let config = response;
    this.configSource.next(config.body);
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

  getApiPosts(postType: string = 'pages', params: any[] = []) {
    let thisUrl = this.config['apiUrls']['apidomain'] + this.config['apiUrls'][postType];

    _.forEach(params, function(value) {
      thisUrl += value;
    });

    this.getArray(thisUrl).subscribe( response => { 

      let state: Pages | Posts | Menus | Testimonials = {
        total: Number(response.headers.get('X-WP-Total')),
        loaded: 0,
        items: response.body
      }

      //special case for menus
      if(postType === 'menus'){
        let arrayOfAllMenus = response.body;

        if(arrayOfAllMenus.length) {
          for (let menu of arrayOfAllMenus) {
            this.getJson(menu['meta']['links']['self']).subscribe( response => {
              this.menusStoreService.addMenu(response.body, state.total);
            });
          }
        }
      } else {
        this.sendToStore(postType, state);
      }
    });
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