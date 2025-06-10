import { TestBed } from '@angular/core/testing';

import { PageChangeService } from './page-change.service';

describe('PageChangeService', () => {
  let service: PageChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
