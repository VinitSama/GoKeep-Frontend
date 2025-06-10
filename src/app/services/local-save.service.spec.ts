import { TestBed } from '@angular/core/testing';

import { LocalSaveService } from './local-save.service';

describe('LocalSaveService', () => {
  let service: LocalSaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
