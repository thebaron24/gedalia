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
  private postsSource  = new Subject<any[]>();
  private menuSource  = new Subject<Object>();
 
  // Observable string streams
  config$ = this.configSource.asObservable();
  pages$  = this.pagesSource.asObservable();
  posts$  = this.postsSource.asObservable();
  menu$  = this.menuSource.asObservable();

  constructor(private http: HttpClient) {
    //get config
    this.getConfig();

    this.config$.subscribe(config => {
      this.getMenu();
      this.getPages();
      this.getPosts();
    });
  }

  getJson(url) {
  	return this.http.get(url);
	}

	getArray(url) {
  	return this.http.get<any[]>(url);
	}

  getConfig() {
    this.getJson("/assets/config.json").subscribe(data => {
      console.log("api call for config", data);
      this.configSource.next(data);
    });
  }

	getPages() {
    this.getArray("http://api.baronwilson.io/wp-json/wp/v2/pages").subscribe(data => {
      console.log("api call for pages", data);
      this.pagesSource.next(data);
    });
	}

  getPosts() {
    this.getArray("http://api.baronwilson.io/wp-json/wp/v2/posts").subscribe(data => {
      console.log("api call for posts", data);
      this.postsSource.next(data);
    });
  }

  getMenu() {
    this.getJson("http://api.baronwilson.io/wp-json/wp-api-menus/v2/menus/2").subscribe(data => {
      console.log("api call for menu", data);
      this.menuSource.next(data);
    });
  }
}
