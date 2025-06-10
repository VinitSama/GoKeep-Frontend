import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLabeledNotesComponent } from './show-labeled-notes.component';

describe('ShowLabeledNotesComponent', () => {
  let component: ShowLabeledNotesComponent;
  let fixture: ComponentFixture<ShowLabeledNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowLabeledNotesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowLabeledNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
