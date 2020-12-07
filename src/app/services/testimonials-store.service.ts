import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Testimonials } from '../models/testimonials.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TestimonialsStoreService {

  
  // - We set the initial state in BehaviorSubject's constructor
  // - Nobody outside the Store should have access to the BehaviorSubject 
  //   because it has the write rights
  // - Writing to state should be handled by specialized Store methods (ex: addTestimonial, removeTestimonial, etc)
  // - Create one BehaviorSubject per store entity, for example if you have TestimonialGroups
  //   create a new BehaviorSubject for it, as well as the observable$, and getters/setters
  private readonly _testimonials = new BehaviorSubject<Testimonials>({
    total: 0,
    loaded: 0,
    slug: '',
    items: []
  });

  // Expose the observable$ part of the _testimonials subject (read only stream)
  readonly testimonials$ = this._testimonials.asObservable();


  // we'll compose the testimonials$ observable with map operator to create a stream of specific
  readonly homeWordpress$ = this.testimonials$.pipe(
    map(testimonials => this.testimonials.items.filter(testimonial => testimonial.slug === 'home'))
  )

  // the getter will return the last value emitted in _testimonials subject
  get testimonials(): Testimonials {
    return this._testimonials.getValue();
  }

  // assigning a value to this.testimonials will push it onto the observable 
  // and down to all of its subsribers (ex: this.testimonials = [])
  set testimonials(val: Testimonials) {
    this._testimonials.next(val);
  }

  addTestimonial(testimonial: object, total: number) {
    // we assaign a new copy of testimonials by adding a new testimonial to it 
    // with no duplicate ids
    this.testimonials.total = total ? total : this.testimonials.total;

    this.testimonials.items = _.unionBy(this.testimonials.items, [testimonial],'id');
    this.testimonials.loaded = this.testimonials.items.length;

    this.testimonials = {...this.testimonials};
  }

  addTestimonials(testimonials: any[], total: number) {
    // we assaign a new copy of testimonials by adding a new testimonial array to it 
    // with no duplicate ids
    this.testimonials.total = total ? total : this.testimonials.total;

    this.testimonials.items  = _.unionBy(this.testimonials.items, testimonials, 'id');
    this.testimonials.loaded = this.testimonials.items.length;

    this.testimonials = {...this.testimonials};
  }

  removeTestimonial(slug: string, total: number) {
    this.testimonials.total = total;
    this.testimonials.loaded--;
    this.testimonials.items = this.testimonials.items.filter(testimonial => testimonial.slug !== slug);
    let reduced = this.testimonials.items.filter(testimonial => testimonial.slug !== slug);
    if(reduced.length < this.testimonials.items.length){
      this.testimonials.loaded--;
      this.testimonials.items = reduced;
    }
  }

}
