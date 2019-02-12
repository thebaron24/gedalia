import { TestBed } from '@angular/core/testing';

import { AsyncApiCallHelperService } from './async-api-call-helper.service';

describe('AsyncApiCallHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AsyncApiCallHelperService = TestBed.get(AsyncApiCallHelperService);
    expect(service).toBeTruthy();
  });
});
