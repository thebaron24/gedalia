import { TestBed } from '@angular/core/testing';

import { PagesStoreService } from './pages-store.service';

describe('StoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PagesStoreService = TestBed.get(PagesStoreService);
    expect(service).toBeTruthy();
  });
});
