import { TestBed } from '@angular/core/testing';

import { MenusStoreService } from './menus-store.service';

describe('StoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MenusStoreService = TestBed.get(MenusStoreService);
    expect(service).toBeTruthy();
  });
});
