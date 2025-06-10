import { TestBed } from '@angular/core/testing';

import { NoteLabelService } from './note-label.service';

describe('NoteLabelService', () => {
  let service: NoteLabelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteLabelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
