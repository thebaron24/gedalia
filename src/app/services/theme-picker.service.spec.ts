import { TestBed } from '@angular/core/testing';

import { ThemePickerService } from './theme-picker.service';

describe('ThemePickerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThemePickerService = TestBed.get(ThemePickerService);
    expect(service).toBeTruthy();
  });
});
