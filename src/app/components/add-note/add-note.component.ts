import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule} from '@angular/material/input'
import { NoteService } from '../../services/note.service';
import { NoteCreateRequestModel } from '../../models/note-create-request-model';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-add-note',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ClickOutsideDirective,
  ],
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.css'
})
export class AddNoteComponent {

  newNote!: FormGroup;
  openedCard: boolean = false;
  @Output() newNoteEmitter = new EventEmitter<[NoteCreateRequestModel,number]>();

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
  ){
    this.newNote = this.fb.group({
      title: [''],
      content: [''],
      isPinned: [false],
      isArchived: [false],
      isTrashed: [false]
    })
  }

  toggle(field: 'isPinned' | 'isArchived' | 'isTrashed') {
    const current = this.newNote.get(field)?.value;
    this.newNote.get(field)?.setValue(!current);
  }

  async onClose(){
    const createNote: NoteCreateRequestModel = this.newNote.value;
    console.log(createNote);
    const response = await this.noteService.createNewNote(createNote);
    if (response?.responseCode == 201 && response.data){
      this.newNoteEmitter.emit([createNote,response.data]);
      this.newNote.get('title')?.setValue('');
      this.newNote.get('content')?.setValue('');
      this.newNote.get('isPinned')?.setValue(false);
      this.newNote.get('isArchived')?.setValue(false);
      this.newNote.get('isTrashed')?.setValue(false);
      this.openedCard = false;
      // this.newNote.reset();
    } else {
      console.log("note create unsuccessful");
    }
  }



  async addArchive(){
    this.toggle('isArchived');
    await this.onClose();
  }

  openCard() {
    this.openedCard = true;
  }

  closeCard() {
    if (this.newNote.get('title')?.value != '' || this.newNote.get('content')?.value != '') {
      this.onClose();
    }
    this.openedCard = false;
  }

  dummy() {
  }

}
