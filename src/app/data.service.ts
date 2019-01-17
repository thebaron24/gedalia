import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject }    from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

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

  config: Object;
  menu: Object;
  pageMap: Object = {};
  currentPage: Array<any>;

  constructor(private http: HttpClient) {
    //get config
    this.getConfig();

    this.config$.subscribe(config => {
      //here we know the config is set - safe to initialize menu
      this.getMenu();
      //this.getPages();
      //this.getPosts();
    });
  }

  getJson(url) {
  	return this.http.get(url);
	}

	getArray(url) {
  	return this.http.get<any[]>(url);
	}

  getConfig() {
    if(this.config && Object.keys(this.config).length > 0) {
      console.log("config already exists - using", this.config);
      this.configSource.next(this.config)
    } else {
      this.getJson("/assets/config.json").subscribe(data => {
        console.log("api call returned for config", data);
        this.config = data;
        this.configSource.next(data);
      });
    }
  }

  getPage(page: string) {
    if(Object.keys(this.config).length > 0 && this.pageMap[page]){
      console.log(page + " page already exists - using: ", this.pageMap[page]);
      this.currentPage = this.pageMap[page];
      this.pageSource.next(this.pageMap[page]);
    } else {
      this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']+this.config['apiUrls']['param']['slug']+page).subscribe(data => {
        console.log("api call returned for " + page + " page: ", data);
        this.currentPage = data;
        this.pageMap[page] = data;
        this.pageSource.next(data);
      });
    }
  }

  getMenu() {
    if(this.menu && Object.keys(this.menu).length > 0) {
      this.getJson(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['menu']).subscribe(data => {
        console.log("api call returned for menu: ", data);
        this.menu = data;
        this.menuSource.next(data);
      });
    } else {
      console.log("menu object exists - using: ", this.menu);
    }
  }

  getPages() {
    this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['pages']).subscribe(data => {
      console.log("api call for pages", data);
      this.pagesSource.next(data);
    });
  }

  getPosts() {
    this.getArray(this.config['apiUrls']['apidomain'] + this.config['apiUrls']['posts']).subscribe(data => {
      console.log("api call for posts", data);
      this.postsSource.next(data);
    });
  }
}
