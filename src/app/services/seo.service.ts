import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { Optional, RendererFactory2, ViewEncapsulation, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { DataService } from './data.service';

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

  constructor(
    private titleService: Title,
  	private metaService: Meta,
    private dataService: DataService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document) {

      this.renderer = this.rendererFactory.createRenderer(this.document, {
        id: '-1',
        encapsulation: ViewEncapsulation.None,
        styles: [],
        data: {}
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
    console.log("SeoService: attempting to remove tag ", tag);
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
      console.log("SeoService: attempting to add tag ", tag);
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

  handleSeo(page: Array<any>, config: object) {
  	let pageObject = page[0];
  	this.setTitle(pageObject['title']['rendered']);

    console.log((pageObject['slug'] == 'home'), pageObject['slug'], config['apiUrls']['domain'] + '/' + pageObject['slug']);

    let conUrl = config['apiUrls']['domain'] ;
    if(pageObject['slug'] !== 'home') { 
      conUrl += pageObject['slug'];
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
