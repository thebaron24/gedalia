import { TestBed } from '@angular/core/testing';

import { TestimonialsStoreService } from './testimonials-store.service';

describe('StoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TestimonialsStoreService = TestBed.get(TestimonialsStoreService);
    expect(service).toBeTruthy();
  });
});
