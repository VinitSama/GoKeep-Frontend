import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AddNoteComponent } from "../add-note/add-note.component";
import { NoteDisplayComponent } from "../note-display/note-display.component";
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note';
import { Label } from '../../models/label';
import { NoteLabelService } from '../../services/note-label.service';
import { NoteService } from '../../services/note.service';
import { Subscription } from 'rxjs';
import { PageChangeService } from '../../services/page-change.service';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-show-labeled-notes',
  standalone: true,
  imports: [
    AddNoteComponent,
    NoteDisplayComponent,
    CommonModule,
  ],
  templateUrl: './show-labeled-notes.component.html',
  styleUrl: './show-labeled-notes.component.css'
})
export class ShowLabeledNotesComponent implements OnInit {
  
  @Input() allNotes!: Array<Note>;
  @Input() labelArray!: Array<Label>;
  @Input() labelId!: number;
  @Input() searchTerm!: string;
  
  @Output() toggleEmitter = new EventEmitter<{option:'togglePin' | 'toggleArchive' | 'toggleTrash', noteId: number}>();
  @Output() deleteForeverEmitter = new EventEmitter<number>();
  @Output() makeCopyEmitter = new EventEmitter<{oldId:number, newId:number}>();
  
  notes: Array<Note> = [];
  pinnedNotes: Array<Note> = [];
  archivedNotes: Array<Note> = [];
  noteLabels: Array<number> = [];
  
  private refreshSubscription!: Subscription;
  private pageChangeSubscription!: Subscription;

  constructor(private noteLabelService: NoteLabelService, private pageChangeService: PageChangeService, private refreshService: RefreshService) {}

  async ngOnInit() {
    await this.getNoteLabels()
    await this.noteSeggregation()
    this.pageChangeSubscription = this.pageChangeService.getPage().subscribe(async (pageName) => {
      if (pageName != 'firstPage' && pageName != 'archive' && pageName != 'trash') {
        if (pageName != this.labelId.toString()) {
          try{
            this.labelId = parseInt(pageName);
            await this.getNoteLabels();
            await this.noteSeggregation()
          } catch {
            console.error("invalid page name");
          }
        }
      }
    });

    this.refreshSubscription = this.refreshService.getRefreshTrigger().subscribe( async () => {
      await this.getNoteLabels();
      await this.noteSeggregation();
    })
    
  }

  private async getNoteLabels() {
    const response = await this.noteLabelService.getNoteIdByLabelId(this.labelId);
    if (response?.responseCode == 200 && response?.data != undefined) {
      this.noteLabels = response.data;
    }else {
      //snackbar
    }
  }

  makeCopy(oldId:number, newId:number) {
    this.makeCopyEmitter.emit({oldId: oldId, newId:newId});
    this.noteSeggregation();
  }

  deleteForever(noteId:number) {
    this.deleteForeverEmitter.emit(noteId);
    this.noteSeggregation();
  }

  toggleSetting(option: 'togglePin' | 'toggleArchive' | 'toggleTrash', noteId: number) {
    this.toggleEmitter.emit({option:option,noteId:noteId});
    this.noteSeggregation();
  }


  private noteSeggregation() {
    this.notes = [];
    this.archivedNotes = [];
    this.pinnedNotes = [];
    this.allNotes.forEach(note => {
      if (this.noteLabels.includes(note.noteId)){
        this.notes.push(note);
      }
    });
    this.notes = this.notesSegregation(this.notes);
    
  }

  private notesSegregation(notes: Array<Note>) {
    this.archivedNotes = [];
    this.pinnedNotes = [];
    notes.forEach(note => {
      if (note.isArchived) {
        this.archivedNotes.push(note);
      }
      else if (note.isPinned) {
        this.pinnedNotes.push(note);
      }
    });
    let noteArray = notes.filter(note => 
      !this.archivedNotes.includes(note) &&
      !this.pinnedNotes.includes(note) &&
      !note.isTrashed
    );
    return noteArray;
  }

  // private async loadNotes() {
  //   const response = await this.noteService.getAllNotes();
  //   if (response?.responseCode == 200 && response.data) {
  //     this.allNotes = response.data;
  //   }
  // }
  
  // private async refreshData() {
  //   await this.getNoteIdByLabelId();
  // }
  
}
