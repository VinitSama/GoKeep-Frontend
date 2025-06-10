import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import { Note } from '../../models/note';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { ApiResponseModel } from '../../models/api-response-model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoteUpdateRequestModel } from '../../models/note-update-request-model';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { NoteCreateRequestModel } from '../../models/note-create-request-model';
import { RefreshService } from '../../services/refresh.service';
import { UpdateNoteDataTransferModel } from '../../models/update-note-data-transfer-model';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-update-note',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './update-note.component.html',
  styleUrl: './update-note.component.css'
})
export class UpdateNoteComponent implements OnDestroy {

  updateNote!: FormGroup;
  pinned: boolean = false;
  archived: boolean = false;
  updateSubject = new Subject<UpdateNoteDataTransferModel>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public note: Note, 
    private fb: FormBuilder, 
    private noteService: NoteService,
    private dialogRef: MatDialogRef<UpdateNoteComponent>,
  ) {
    this.updateNote = this.fb.group({
      title: [note.title],
      content: [note.content]
    })
    this.pinned = note.isPinned;
    this.archived = note.isArchived;
  }

  async onClose(){
    const updateNote: NoteUpdateRequestModel = this.updateNote.value;
    if (updateNote.title == this.note.title && updateNote.content == this.note.title){
      return;
    }
    const response = await this.noteService.updateNotes(this.note.noteId, updateNote);
    if (response?.responseCode == 204){
    } else {
      console.log("note update unsuccessful");
    }
    this.dialogRef.close()

  }
  async addArchive(){
    this.toggleOption('toggleArchive');
    await this.onClose();
  }

  ngOnDestroy(): void {
    this.onClose()
    let updateNote: NoteUpdateRequestModel = this.updateNote.value;
    let updateDataTransfer: UpdateNoteDataTransferModel = {
      title: updateNote.title,
      content: updateNote.content
    }
    this.updateSubject.next(updateDataTransfer);
  }
  async toggleOption(optionName: 'togglePin' | 'toggleArchive' | 'toggleTrash') {
    const response = await this.noteService.toggleOption(this.note.noteId, optionName);
    if (response?.responseCode == 204) {
      let updateDataTransfer: UpdateNoteDataTransferModel = {
        toggleOption: optionName
      }
      this.updateSubject.next(updateDataTransfer);
      if (optionName == "togglePin") {
        this.pinned = !this.pinned;
        this.dialogRef.close();
      }
      else if (optionName == "toggleArchive") {
        this.archived = !this.archived;
      }
      if (optionName == 'toggleTrash') {
        this.dialogRef.close();
      }
    }
  }

  async makeCopy() {
    let copyNote: NoteCreateRequestModel = {
      title: this.note.title,
      content: this.note.content,
      isPinned: this.note.isPinned,
      isArchived: this.note.isArchived,
      isTrashed: false
    }

    const response = await this.noteService.createNewNote(copyNote);
    if (response?.responseCode ==201) {
      let updateDataTransfer: UpdateNoteDataTransferModel = {
        createNewNote: response.data
      }
      this.updateSubject.next(updateDataTransfer);
    } else {
      console.log("note copy unsuccessfull")
    } 
  }

  async deleteForever() {
    const response = await this.noteService.deleteForever(this.note.noteId);
    if (response?.responseCode == 204) {
      
      this.dialogRef.close();
    } else {
      console.log("note delete unsuccessfull");
    }
  }

  

}
