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
  // - Writing to state should be handled by specialized Store methods (ex: addTodo, removeTodo, etc)
  // - Create one BehaviorSubject per store entity, for example if you have TodoGroups
  //   create a new BehaviorSubject for it, as well as the observable$, and getters/setters
  private readonly _pages = new BehaviorSubject<Pages>({
    total: 0,
    loaded: 0,
    items: []
  });

  // Expose the observable$ part of the _pages subject (read only stream)
  readonly pages$ = this._pages.asObservable();


  // we'll compose the pages$ observable with map operator to create a stream of only home pages
  readonly homePages$ = this.pages$.pipe(
    map(pages => this.pages.items.filter(page => page.slug === 'home'))
  )

  // the getter will return the last value emitted in _todos subject
  get pages(): Pages {
    return this._pages.getValue();
  }

  // assigning a value to this.todos will push it onto the observable 
  // and down to all of its subsribers (ex: this.todos = [])
  set pages(val: Pages) {
    this._pages.next(val);
    console.log("Pages: ", val);
  }

  addPage(page: object, total: number) {
    // we assaign a new copy of todos by adding a new todo to it 
    // with automatically assigned ID ( don't do this at home, use uuid() )
    this.pages.total = total;
    this.pages.loaded++;
    this.pages.items  = [
    	...this.pages.items,
    	page
    ];
    this.pages = {...this.pages};
  }

  addPages(pages: any[], total: number) {
    // we assaign a new copy of todos by adding a new todo to it 
    // with automatically assigned ID ( don't do this at home, use uuid() )
    this.pages.total = total;
    this.pages.items  = _.union(this.pages.items, pages);
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
