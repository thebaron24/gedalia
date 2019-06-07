import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject, forkJoin}    from 'rxjs';
import { Optional, RendererFactory2, ViewEncapsulation, Inject } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { DataService } from './data.service';
import { PagesStoreService } from './pages-store.service';
import { PostsStoreService } from './posts-store.service';

import configJson from '../../assets/config.json';

declare type LinkDefinition = {
  charset?: string;
  crossorigin?: string;
  href?: string;
  hreflang?: string;
  media?: string;
  rel?: string;
  rev?: string;
  sizes?: string;
  target?: string;
  type?: string;
  } & {
  [prop: string]: string;
};

@Injectable({
  providedIn: 'root'
})
export class SeoService implements OnInit, OnDestroy {

	subscriptions: any = {};
  renderer: any;
  route;
  config = configJson;

  constructor(
    private titleService: Title,
  	private metaService: Meta,
    private router: Router,
    private dataService: DataService,
    private pagesStoreService: PagesStoreService,
    private postsStoreService: PostsStoreService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document) {

      this.renderer = this.rendererFactory.createRenderer(this.document, {
        id: '-1',
        encapsulation: ViewEncapsulation.None,
        styles: [],
        data: {}
      });

      this.subscriptions.config = this.dataService.config$.subscribe((config) => {
         this.config = config;
      });

      this.subscriptions.router = this.router.events.subscribe((routerEventResponse) => {
        if(routerEventResponse instanceof NavigationEnd) {
          this.route = (routerEventResponse.url === '/') ? 'home' : routerEventResponse.url.replace('/', '');
        }
      });

      this.subscriptions.pages = this.pagesStoreService.pages$.subscribe(pages => {
        pages.items.filter(page => {
          if( page.slug === this.route ) {
            this.handle(page, this.config);
          }
        })
      });

      this.subscriptions.posts = this.postsStoreService.posts$.subscribe(posts => {
        posts.items.filter(post => {
          if( post.slug === this.route ) {
            this.handle(post, this.config);
          }
        })
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    Object.keys(this.subscriptions).forEach(key => this.subscriptions[key].unsubscribe());
  }

  updateTag(tag: LinkDefinition) {
    this.removeTag(tag);
    this.addTag(tag);
  }

   /**
   * Remove link with attribute rel
   */
  removeTag(tag: LinkDefinition) {
    try {

        const selector = this._parseSelector(tag);

        const canonical = this.document.querySelector(selector)
        const head = this.document.head;

        if (head === null) {
            throw new Error('<head> not found within DOCUMENT.');
        }
        if (!!canonical) {
            this.renderer.removeChild(head, canonical);
        }
    } catch (e) {
        console.error('Error within linkService : ', e);
    }
  }

  /**
   * Inietta il link ocme ultimo child del tag <head>
   */
  addTag(tag: LinkDefinition) {
      try {

            const link = this.renderer.createElement('link');
            const head = this.document.head;


            if (head === null) {
                throw new Error('<head> not found within DOCUMENT.');
            }


          Object.keys(tag).forEach((prop: string) => {
              return this.renderer.setAttribute(link, prop, tag[prop]);
          });

          // [TODO]: get them to update the existing one (if it exists) ?
          this.renderer.appendChild(head, link);

      } catch (e) {
          console.error('Error within linkService : ', e);
      }
  }

  private _parseSelector(tag: LinkDefinition): string {
      const attr: string = tag.rel ? 'rel' : 'hreflang';
      return `link[${attr}="${tag[attr]}"]`;
  }

  handle(page: object, config: object) {
  	let pageObject = page;
  	this.setTitle(pageObject['title']['rendered']);

    let conUrl = config['apiUrls']['domain'] ;
    if(pageObject['slug'] !== 'home') { 
      conUrl += '/' + pageObject['slug'];
    }
    this.removeTag({ rel: 'canonical' });
    this.addTag({ rel: 'canonical', href: conUrl });

    this.metaService.addTag({ name: 'description', content: pageObject['excerpt']['rendered'].replace(/<(?:.|\n)*?>/gm, ' ') })

    //this.updateTag( { rel: 'canonical', href: "http://gedaliahealingarts.com" + '/' + (pageObject['slug'] == 'home') ? '' : pageObject['slug'] } );
  }

  setTitle( newTitle: string): void {
    this.titleService.setTitle( newTitle );
  }
}
