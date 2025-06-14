import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule} from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon';
import { AddNoteComponent } from "../add-note/add-note.component";
import { NoteService } from '../../services/note.service';
import { Note } from '../../models/note';
import { CommonModule } from '@angular/common';
import { NoteDisplayComponent } from "../note-display/note-display.component";
import { Subscription } from 'rxjs';
import { PageChangeService } from '../../services/page-change.service';
import { MatGridListModule } from '@angular/material/grid-list'
import { Label } from '../../models/label';
import { LabelService } from '../../services/label.service';
import { NoteLabelService } from '../../services/note-label.service';
import { NoteLabel } from '../../models/note-label';
import { ShowLabeledNotesComponent } from '../show-labeled-notes/show-labeled-notes.component';
import { SearchService } from '../../services/search.service';
import { RefreshService } from '../../services/refresh.service';
import { NoteCreateRequestModel } from '../../models/note-create-request-model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    AddNoteComponent,
    CommonModule,
    NoteDisplayComponent,
    MatGridListModule,
    ShowLabeledNotesComponent,
],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  notes: Array<Note> = [];
  notesCopy: Array<Note> = [];
  labelArray: Array<Label> = [];
  pinnedNotes: Array<Note> = [];
  archivedNotes: Array<Note> = [];
  trashedNotes: Array<Note> = [];
  firstPage: boolean = true;
  archivePage: boolean = false;
  trashPage: boolean = false;
  labelPage: boolean = false;
  selectedLabel: number = -1;
  searchTerm: string = '';
  labelPageName: string = '';

  @Output() makeNewLabel = new EventEmitter<Label>();
  
  private pageChangeSubscription!: Subscription;
  private refreshSubscription!: Subscription;
  private searchSubscription!: Subscription;

  constructor(private noteService: NoteService, private pageChangeService: PageChangeService, private labelService: LabelService, private searchService: SearchService, private refreshService: RefreshService) {
    // this.loadNotes();
    // this.loadLabels();
  }

  private async loadNotes() {
    const response = await this.noteService.getAllNotes();
    if (response?.responseCode != 200 || !response.data) {
      return;
    }
    this.notes = response.data;
    this.notesCopy = [...this.notes];
    this.notes = this.notesSegregation(this.notes);
  }

  private async loadLabels() {
    const response = await this.labelService.getAllLabels();
    if (response?.responseCode == 200 && response.data) {
      this.labelArray = response.data;
    }
  }
  async ngOnInit() {
    await this.loadLabels();
    await this.loadNotes();
    this.refreshSubscription = this.refreshService.getRefreshTrigger().subscribe(async () => {
      await this.loadNotes();
      await this.loadLabels();
    })
    
    this.pageChangeSubscription = this.pageChangeService.getPage().subscribe(async (pageName) => {
      // await this.loadNotes();
      this.onPageChange(pageName);
    });
    
    if (this.archivePage || this.trashPage) {
      this.firstPage = false;
    }
    this.searchSubscription = this.searchService.getSearchTerm().subscribe((searchTerm) => {
      this.searchTerm = searchTerm;
      this.filterNotes();
    });
  }

  private filterNotes() {
    this.searchTerm = this.searchTerm.trimStart().toLowerCase();
    if(!this.searchTerm) {
      this.notes = [...this.notesCopy];
      return;
    }
    this.notes = this.notesCopy.filter(note => 
      note.content.toLowerCase().includes(this.searchTerm) ||
      note.title.toLowerCase().includes(this.searchTerm)
    );
    this.notes = this.notesSegregation(this.notes);
  }

  private onPageChange(pageName: string) {
    this.firstPage = false;
    this.archivePage = false;
    this.trashPage = false;
    this.labelPage = false;
    if (pageName == 'firstPage') {
      this.firstPage = true;
    } else if (pageName == 'archive') {
      this.archivePage = true;
    } else if (pageName == 'trash') {
      this.trashPage = true;
    } else {
      this.labelArray.forEach(label => {
        if (label.id.toString() == pageName) {
          this.labelPage = true;
          this.selectedLabel = label.id;
          this.labelPageName = label.name;
        };
      });
      if (!this.labelPage){
        this.firstPage = true;
      }
    }
  }

  addNewNoteWithLabel(data: {note:[NoteCreateRequestModel,number], label: number}){
    this.addNewNote(data.note, data.label);
  }

  addNewNote(data: [NoteCreateRequestModel, number], labelid:number = -1) {
    const noteData = data[0];
    const note: Note = {
      noteId: data[1],
      title: noteData.title,
      content: noteData.content,
      isArchived: noteData.isArchived,
      isPinned: noteData.isPinned,
      isTrashed: noteData.isTrashed,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      labelIds: []
    }
    if (labelid>0){
      note.labelIds.push(labelid);
    }
    this.notesCopy.unshift(note);
    this.notes = this.notesSegregation(this.notesCopy);
  }

  private notesSegregation(notes: Array<Note>) {
    this.pinnedNotes = [];
    this.archivedNotes = [];
    this.trashedNotes = [];
    notes.forEach(note => {
      if (note.isTrashed) {
        this.trashedNotes.push(note);
      }
      else if (note.isArchived) {
        this.archivedNotes.push(note);
      }
      else if (note.isPinned) {
        this.pinnedNotes.push(note);
      }
    });
    let noteArray = notes.filter(note => 
      !note.isArchived &&
      !note.isPinned &&
      !note.isTrashed
    );
    return noteArray;
  }

  toggleSetting(optionName: 'togglePin' | 'toggleArchive' | 'toggleTrash' , noteId: number) {
    if (optionName == 'toggleArchive') {
      this.toggleArchive(noteId);
    } else if (optionName == 'togglePin') {
      this.togglePin(noteId);
    } else {
      this.toggleTrash(noteId);
    }
  }

  private toggleArchive(noteId: number) {
    const note = this.notesCopy.find(n => n.noteId == noteId);
    if (note) {
      note.isArchived = !note.isArchived;
      this.notes = this.notesSegregation(this.notesCopy);
    }
  }

  private togglePin(noteId: number) {
    const note = this.notesCopy.find(n => n.noteId == noteId);
    if (note) {
      note.isPinned = !note.isPinned;
      this.notes = this.notesSegregation(this.notesCopy);
    }
  }

  private toggleTrash(noteId: number) {
    const note = this.notesCopy.find(n => n.noteId == noteId);
    if (note) {
      note.isTrashed = !note.isTrashed;
      this.notes = this.notesSegregation(this.notesCopy);
    }
  }

  deleteForever(noteId: number) {
    const note = this.notesCopy.find(n => n.noteId == noteId);
    if (note) {
      note.isActive = false;
      this.notes = this.notesSegregation(this.notesCopy);
    }
  }

  makeCopy(oldNoteId: number, newNoteId: number) {
    let note = this.notesCopy.find(n => n.noteId == oldNoteId);
    if (note) {
      let newNote: Note = {
        noteId: newNoteId,
        title: note.title,
        content: note.content,
        isArchived: note.isArchived,
        isPinned: note.isPinned,
        isTrashed: note.isTrashed,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        labelIds: note.labelIds
      }
      this.notesCopy.unshift(newNote);
      this.notes = this.notesSegregation(this.notesCopy);
    }
  }

  emitLabel(label:Label){
    this.makeNewLabel.emit(label);
  }

}
