import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Label } from '../../models/label';
import { LabelService } from '../../services/label.service';
import { FormsModule } from '@angular/forms';
import { LabelCreateResponseModel } from '../../models/label-create-response-model';
import { DialogRef } from '@angular/cdk/dialog';
import { MatDivider } from '@angular/material/divider';
import { LabelCreateRequestModel } from '../../models/label-create-request-model';
import { RefreshService } from '../../services/refresh.service';
import { Subject } from 'rxjs';
import { EditLabelDataTransferModel } from '../../models/edit-label-data-transfer-model';

@Component({
  selector: 'app-edit-labels',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatFormField,
    MatDivider,
  ],
  templateUrl: './edit-labels.component.html',
  styleUrl: './edit-labels.component.css'
})
export class EditLabelsComponent implements OnDestroy {

  createLabel: string = '';
  currentEditLabelName: string = '';
  editDataSubject = new Subject<EditLabelDataTransferModel>();

  private currentEditLabelId: number = -1;
  private showTrashIcon: number = -1;
  
  constructor(@Inject(MAT_DIALOG_DATA) public labels: Array<Label>, private labelService: LabelService, private matDialogRef: MatDialogRef<EditLabelsComponent>, private refreshService: RefreshService) {}

  async addNewLabel(){
    this.createLabel = this.createLabel.trim();
    if (this.createLabel != '') {
      const newLabel: LabelCreateRequestModel = {
        label: this.createLabel
      };
      const response = await this.labelService.addNewLabel(newLabel);
      if (response?.responseCode == 201 && response.data) {
        await this.refreshComponent()
        // this.refreshService.triggerRefresh();

        const dataTransfer: EditLabelDataTransferModel = {
          label: this.createLabel,
          id: response.data,
          add: true
        }
        this.editDataSubject.next(dataTransfer);
        this.createLabel = '';
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    this.closeComponent();
  }

  private async refreshComponent() {
    const allLabelResponse = await this.labelService.getAllLabels();
      if (allLabelResponse?.responseCode && allLabelResponse.data) {
        this.labels = allLabelResponse.data;
      }
  }

  notEditable(index: number) {
    return !(index == this.currentEditLabelId);
  }

  editLabel(index: number) {
    this.addNewLabel();
    this.updateEdit()
    this.currentEditLabelId = index;
    if (index != -1) {
      this.currentEditLabelName = this.labels[this.currentEditLabelId].name;
    }
  }

  mouseOver(index: number){
    this.showTrashIcon = index
  }

  mouseOut() {
    this.showTrashIcon = -1
  }

  canShow(index: number) {
    return index == this.showTrashIcon;
  }
  

  async closeComponent() {
    if (await this.addNewLabel() || await this.updateEdit()) {
      this.matDialogRef.close()
    } else {
      //snackbar
    }
    this.matDialogRef.close()
  }

  cancel() {
    this.createLabel = '';
    this.currentEditLabelId = -2;
  }

  add() {
    this.currentEditLabelId = -1;
  }

  async deleteLabel(index: number = -1) {
    if (index < 0) {
      return;
    }
    const response = await this.labelService.deleteLabel(this.labels[index].id);
    if (response?.responseCode == 204 ) {
      this.labels.splice(this.currentEditLabelId,1);
      this.currentEditLabelId = -2;
      // await this.refreshComponent();
      // this.refreshService.triggerRefresh();
      const dataTransfer: EditLabelDataTransferModel = {
        delete: true,
        index: index
      }
      this.editDataSubject.next(dataTransfer);
      this.labels.splice(index,1);
    } else {
      //snackbar
    }
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  async updateEdit(){
    if (this.currentEditLabelId >-1) {
      if (this.currentEditLabelName != this.labels[this.currentEditLabelId].name) {
        const response = await this.labelService.updateLabel(this.labels[this.currentEditLabelId].id, this.currentEditLabelName);
        if (!response || response.responseCode != 204) {
          //snackbar
          this.cancel();
          return false;
        }
        this.labels[this.currentEditLabelId].name = this.currentEditLabelName;
        // this.refreshService.triggerRefresh();
        const dataTransfer: EditLabelDataTransferModel = {
          update: true,
          index: this.currentEditLabelId,
          label: this.currentEditLabelName
        }
        this.editDataSubject.next(dataTransfer);
        this.labels[this.currentEditLabelId].name = this.currentEditLabelName;
        this.cancel();
        return true;
      }
    }
    return false
  }

}
