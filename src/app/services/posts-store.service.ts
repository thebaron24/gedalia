import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Posts } from '../models/posts.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PostsStoreService {

  
  // - We set the initial state in BehaviorSubject's constructor
  // - Nobody outside the Store should have access to the BehaviorSubject 
  //   because it has the write rights
  // - Writing to state should be handled by specialized Store methods (ex: addPost, removePost, etc)
  // - Create one BehaviorSubject per store entity, for example if you have PostGroups
  //   create a new BehaviorSubject for it, as well as the observable$, and getters/setters
  private readonly _posts = new BehaviorSubject<Posts>({
    total: 0,
    loaded: 0,
    slug: '',
    items: []
  });

  // Expose the observable$ part of the _wordpress subject (read only stream)
  readonly posts$ = this._posts.asObservable();

  // we'll compose the wordpress$ observable with map operator to create a stream of specific
  readonly homeWordpress$ = this.posts$.pipe(
    map(posts => this.posts.items.filter(post => post.slug === 'home'))
  )

  // the getter will return the last value emitted in _posts subject
  get posts(): Posts {
    return this._posts.getValue();
  }

  // assigning a value to this.posts will push it onto the observable 
  // and down to all of its subsribers (ex: this.posts = [])
  set posts(val: Posts) {
    this._posts.next(val);
  }

  addPost(post: object, total: number) {
    // we assaign a new copy of posts by adding a new post to it 
    // with no duplicate ids
    this.posts.total = total ? total : this.posts.total;

    this.posts.items = _.unionBy(this.posts.items, [post],'id');
    this.posts.loaded = this.posts.items.length;

    this.posts = {...this.posts};
  }

  addPosts(posts: any[], total: number) {
    // we assaign a new copy of posts by adding a new post array to it 
    // with no duplicate ids
    this.posts.total = total ? total : this.posts.total;
    
    this.posts.items  = _.unionBy(this.posts.items, posts, 'id');
    this.posts.loaded = this.posts.items.length;

    this.posts = {...this.posts};
  }

  removePost(slug: string, total: number) {
    this.posts.total = total;
    this.posts.loaded--;
    this.posts.items = this.posts.items.filter(post => post.slug !== slug);
    let reduced = this.posts.items.filter(post => post.slug !== slug);
    if(reduced.length < this.posts.items.length){
      this.posts.loaded--;
      this.posts.items = reduced;
    }
  }

}
