import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pages } from '../models/pages.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PagesStoreService {

  
  // - We set the initial state in BehaviorSubject's constructor
  // - Nobody outside the Store should have access to the BehaviorSubject 
  //   because it has the write rights
  // - Writing to state should be handled by specialized Store methods (ex: addPage, removePage, etc)
  // - Create one BehaviorSubject per store entity, for example if you have PageGroups
  //   create a new BehaviorSubject for it, as well as the observable$, and getters/setters
  private readonly _pages = new BehaviorSubject<Pages>({
    total: 0,
    loaded: 0,
    items: []
  });

  // Expose the observable$ part of the _pages subject (read only stream)
  readonly pages$ = this._pages.asObservable();


  // we'll compose the pages$ observable with map operator to create a stream of only home pages
  readonly currentPage$ = this.pages$.pipe(
    map(pages => this.pages.items.filter(page => page.slug === 'home'))
  )

  // the getter will return the last value emitted in _pages subject
  get pages(): Pages {
    return this._pages.getValue();
  }

  // assigning a value to this.pages will push it onto the observable 
  // and down to all of its subsribers (ex: this.pages = [])
  set pages(val: Pages) {
    this._pages.next(val);
    console.log("Pages: ", val);
  }

  addPage(page: object, total: number) {
    // we assaign a new copy of pages by adding a new page to it 
    // with no duplicate ids
    this.pages.total = total ? total : this.pages.total;

    this.pages.items = _.unionBy(this.pages.items, [page],'id');
    this.pages.loaded = this.pages.items.length;

    this.pages = {...this.pages};
  }

  addPages(pages: any[], total: number) {
    // we assaign a new copy of pages by adding a new page array to it 
    // with no duplicate ids
    this.pages.total = total ? total : this.pages.total;

    this.pages.items  = _.unionBy(this.pages.items, pages, 'id');
    this.pages.loaded = this.pages.items.length;

    this.pages = {...this.pages};
  }

  removePage(slug: string, total: number) {
    this.pages.total = total;
    let reduced = this.pages.items.filter(page => page.slug !== slug);
    if(reduced.length < this.pages.items.length){
      this.pages.loaded--;
      this.pages.items = reduced;
    }
  }

}
