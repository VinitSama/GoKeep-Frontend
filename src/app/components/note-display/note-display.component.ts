import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Note } from '../../models/note';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoteService } from '../../services/note.service';
import { MatMenuModule } from '@angular/material/menu'
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UpdateNoteComponent } from '../update-note/update-note.component';
import { NoteCreateRequestModel } from '../../models/note-create-request-model';
import { Label } from '../../models/label';
import { NoteLabelService } from '../../services/note-label.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { LabelService } from '../../services/label.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { LabelCreateRequestModel } from '../../models/label-create-request-model';
import { NoteLabelRequestModel } from '../../models/note-label-request-model';
import { RefreshService } from '../../services/refresh.service';
import { UpdateNoteDataTransferModel } from '../../models/update-note-data-transfer-model';

interface labelCheckBox {
  id: number;
  name: string;
  isChecked: boolean;
}

@Component({
  selector: 'app-note-display',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CommonModule,
    MatCheckboxModule,
    FormsModule,
    MatInput,
    ReactiveFormsModule,
  ],
  templateUrl: './note-display.component.html',
  styleUrl: './note-display.component.css'
})
export class NoteDisplayComponent implements OnInit {

  @Input() note!:Note;
  @Input() showLabel: boolean = false;
  @Input() searchTerm!: string;
  @Input() labelsArray!: Array<Label>;
  
  labelControl = new FormControl('');
  filteredOptions!: Observable<labelCheckBox[]>;
  
  labels: Array<Label> = [];
  title: string = '';
  content: string = '';
  pinned: boolean = false;
  showCreateLabel: boolean = false;
  @Output() toggleEmitter = new EventEmitter<'togglePin' | 'toggleArchive' | 'toggleTrash'>();
  @Output() deleteForeverEmitter = new EventEmitter<number>();
  @Output() makeCopyEmitter = new EventEmitter<number>();
  @Output() makeNewLabelEmitter = new EventEmitter<Label>();
  
  private refreshSubscription!: Subscription;
  private labelCheckList: Array<labelCheckBox> = [];
  private archived: boolean = false;

  constructor(private noteService: NoteService, private matDialog: MatDialog, private noteLabelService: NoteLabelService, private labelService: LabelService, private refreshService: RefreshService) {}
  
  private refreshFilterOptions(){
    const val = this.labelControl.value;
    this.labelControl.setValue("");
    this.labelControl.setValue(val);
  }

  highlightText(text: string, isLabel: boolean) {
    if (isLabel){
      text = "#"+text;
    }
    if (!this.searchTerm) {
      return text;
    }
    const regex = new RegExp(`(${this.searchTerm})`, 'gi');
    return text.replace(regex, `<mark>$1</mark>`);
  }
  

  // private async loadLabelArray () {
  //   const response = await this.labelService.getAllLabels();
  //   if(response?.responseCode == 200 && response.data) {
  //     this.labelsArray = response.data;
  //   }
  // }

  refreshLabels() {
    // await this.loadLabelArray();
    this.loadLabels();
    // this.makeLabelCheckbox()
  }

  async ngOnInit() {
    await this.firstCall();
    this.refreshSubscription = this.refreshService.getRefreshTrigger().subscribe(() => {
      this.refreshLabels();
      this.refreshFilterOptions();
    })
  }

  private async firstCall() {
    this.title = this.note.title;
    this.content = this.note.content;
    if (!this.title || this.title == '') {
      this.title = '\n';
    }
    if (!this.content || this.content == '') {
      this.content = '\n';
    }
    this.archived = this.note.isArchived;
    this.pinned = this.note.isPinned;
    if (this.showLabel) {
      this.refreshLabels();
    }
    this.filteredOptions = this.labelControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }


  trackCheckLabel(index: number, label: labelCheckBox): number {
    return label.id;
  }

  private filter(value: string | null) {
    if (value == null || value == undefined || value == '') {
      this.showCreateLabel = false;
      return this.labelCheckList;
    }
    const filterValue = value.toLowerCase();
    const labelWithSameValue = this.labelCheckList.filter(label => label.name.toLowerCase() == value);
    if (labelWithSameValue.length > 0) {
      this.showCreateLabel = false;
    } else this.showCreateLabel = true;
    return this.labelCheckList.filter(label => label.name.toLowerCase().includes(filterValue));
  }


  // private makeLabelCheckbox() {
  //   this.labelCheckList = [];
  //   this.labelsArray.forEach(label => {
  //     let checkLabel: labelCheckBox = {
  //       id: label.id,
  //       name: label.name,
  //       isChecked: false
  //     }
  //     if (this.selectedLabelId.includes(label.id)) {
  //       checkLabel.isChecked = true;
  //     }
  //     this.labelCheckList.push(checkLabel);
  //   });
  // }

  private loadLabels() {
    this.labels = [];
    this.labelCheckList = [];
    this.labelsArray.forEach(label => {
      let checkLabel: labelCheckBox ={
        id: label.id,
        name: label.name,
        isChecked: false
      }
      if (this.note.labelIds.includes(label.id)) {
        this.labels.push(label);
        checkLabel.isChecked = true;
      }
      this.labelCheckList.push(checkLabel);
    });
  }

  async createLabel(labelName: string | null) {
    if (labelName == null) {
      return;
    }
    let labelCreateModel: LabelCreateRequestModel = {
      label: labelName
    }
    const response = await this.labelService.addNewLabel(labelCreateModel);
    if(!response || response.responseCode!=201 || !response.data) {
      //snackbar
      return
    }
    let newLabel: Label = {
      id : response.data,
      name : labelName,
      createdAt : new Date()
    };
    this.makeNewLabelEmitter.emit(newLabel);
    this.labelsArray.unshift(newLabel);
    this.refreshLabels();
    let labelId = this.labelsArray.filter(label => label.name == labelName)?.shift()?.id;
    if (labelId == undefined) {
      //snackbar
      return;
    }
    let noteLabelCreateModel: NoteLabelRequestModel = {
      noteId: this.note.noteId,
      labelId: labelId
    }
    this.note.labelIds.push(response.data);
    const response2 = await this.noteLabelService.addNoteLabel(noteLabelCreateModel);
    if (!response2 || response2.responseCode != 201) {
      //snackbar
      return;
    }
    this.refreshLabels();
    this.labelControl.setValue('');
    this.refreshLabels();
  }

  async updateNoteLabel(checked: boolean, labelId: number) {
    const noteLabelModel: NoteLabelRequestModel = {
      noteId: this.note.noteId,
      labelId: labelId
    }
    if (checked) {
      const response = await this.noteLabelService.addNoteLabel(noteLabelModel);
      if (!response || response.responseCode != 201){
        //snackbar
      }
      else {
        let checkLabel = this.labelCheckList.find(l => l.id == labelId);
        if (checkLabel) {
          checkLabel.isChecked = true;
        }
        let l = this.labelsArray.find(l => l.id == labelId);
        if (l){
          this.labels.unshift(l);
        }
        this.note.labelIds.unshift(labelId);
      }
    }
    else {
      const response = await this.noteLabelService.deleteNoteLabel(noteLabelModel);
      if (!response || response.responseCode != 204){
        //snackbar
      }
      else {
        let checkLabel = this.labelCheckList.find(l => l.id == labelId);
        if (checkLabel) {
          checkLabel.isChecked = false;
        }
        // let l = this.labels.find(l => l.id == labelId);
        // if(l) {
        //   let k = this.labels.indexOf(l);
        //   if (k>=0) [
        //     this.labels.splice(k,1);
        //   ]
        // }
        this.labels = this.labels.filter(l => l.id != labelId);
        this.note.labelIds = this.note.labelIds.filter(id => id != labelId);
      }
    }
    this.refreshFilterOptions();
  }

  async toggleOption(optionName: 'togglePin' | 'toggleArchive' | 'toggleTrash', event: MouseEvent) {
    event.stopPropagation();
    const response = await this.noteService.toggleOption(this.note.noteId, optionName);
    if (response?.responseCode == 204) {
      if (optionName == "togglePin") {
        this.pinned = !this.pinned;
      }
      else if (optionName == "toggleArchive") {
        this.archived = !this.archived;
      }
      this.toggleEmitter.emit(optionName);
    }
  }

  stopPropagationOverload(event: MouseEvent) {
    event.stopPropagation();
  }

  openUpdateComponent() {
    const dialogRef = this.matDialog.open(UpdateNoteComponent, {
      width: '600px',
      data: this.note,
    })

    const instance = dialogRef.componentInstance;

    instance.updateSubject.subscribe((data: UpdateNoteDataTransferModel) => {
      this.makeUpdateChanges(data);
    })

  }

  private makeUpdateChanges(data: UpdateNoteDataTransferModel) {
    if (data.createNewNote && data.createNewNote > -1) {
      this.makeCopyEmitter.emit(data.createNewNote);
    } else if ( data.toggleOption ) {
      this.toggleEmitter.emit(data.toggleOption);
    } if (data.title && data.title != this.note.title) {
      this.note.title = data.title;
      this.title = this.note.title;
      if (!this.title || this.title == '') {
        this.title = '\n';
      }
    } if (data.content && data.content != this.note.content) {
      this.note.content = data.content;
      this.content = this.note.content;
      if (!this.content || this.content == '') {
        this.content = '\n';
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
    if (response?.responseCode ==201 && response.data) {
      this.makeCopyEmitter.emit(response.data);
    } else {
      console.log("note copy unsuccessfull")
    }  
  }

  async deleteForever(event: MouseEvent) {
    event.stopPropagation();
    const response = await this.noteService.deleteForever(this.note.noteId);
    if (response?.responseCode == 204) {
      this.deleteForeverEmitter.emit(this.note.noteId);
    } else {
      console.log("note delete unsuccessfull");
    }
  }

}
