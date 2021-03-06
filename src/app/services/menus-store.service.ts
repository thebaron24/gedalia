import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Menus } from '../models/menus.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class MenusStoreService {

  
  // - We set the initial state in BehaviorSubject's constructor
  // - Nobody outside the Store should have access to the BehaviorSubject 
  //   because it has the write rights
  // - Writing to state should be handled by specialized Store methods (ex: addMenu, removeMenu, etc)
  // - Create one BehaviorSubject per store entity, for example if you have MenuGroups
  //   create a new BehaviorSubject for it, as well as the observable$, and getters/setters
  private readonly _menus = new BehaviorSubject<Menus>({
    total: 0,
    loaded: 0,
    slug: '',
    items: []
  });

  // Expose the observable$ part of the _pages subject (read only stream)
  readonly menus$ = this._menus.asObservable();


  // we'll compose the menus$ observable with map operator to create a stream of only primary menu
  readonly primaryMenu$ = this.menus$.pipe(
    map(menus => this.menus.items.filter(menu => menu.name === 'primary'))
  )

  // the getter will return the last value emitted in _menus subject
  get menus(): Menus {
    return this._menus.getValue();
  }

  // assigning a value to this.menus will push it onto the observable 
  // and down to all of its subsribers (ex: this.menus = [])
  set menus(val: Menus) {
    this._menus.next(val);
  }

  addMenu(menu: object, total: number) {
    // we assaign a new copy of menus by adding a new menu to it 
    // with no duplicate ids
    this.menus.total = total ? total : this.menus.total;

    this.menus.items = _.unionBy(this.menus.items, [menu],'id');
    this.menus.loaded = this.menus.items.length;

    this.menus = {...this.menus};
  }

  addMenus(menus: any[], total: number) {
    // we assaign a new copy of menus by adding a new menu array to it 
    // with no duplicate ids
    this.menus.total = total ? total : this.menus.total;

    this.menus.items  = _.unionBy(this.menus.items, menus, 'id');
    this.menus.loaded = this.menus.items.length;

    this.menus = {...this.menus};
  }

  removemenu(name: string, total: number) {
    this.menus.total = total;
    let reduced = this.menus.items.filter(menu => menu.name !== name);
    if(reduced.length < this.menus.items.length){
      this.menus.loaded--;
      this.menus.items = reduced;
    }
  }

}
