import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageChangeService } from '../../services/page-change.service';
import { LabelService } from '../../services/label.service';
import { Label } from '../../models/label';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditLabelsComponent } from '../edit-labels/edit-labels.component';
import { Subscription } from 'rxjs';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { RefreshService } from '../../services/refresh.service';
import { EditLabelDataTransferModel } from '../../models/edit-label-data-transfer-model';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ClickOutsideDirective,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  labelsArray: Array<Label> = [];
  sidebarOpen: boolean = true;
  selectedPage: string = 'firstPage';
  
  private refreshSubscription!: Subscription;
  private pageChangeSubscription!: Subscription;

  constructor(private pageChangeService: PageChangeService, private labelService: LabelService, private matDialog: MatDialog, private refreshService: RefreshService) {
  }

  changePage(pageName: 'firstPage' | 'archive' | 'trash' | string) {
    this.pageChangeService.changePage('firstPage');
    this.pageChangeService.changePage(pageName);
  }

  ngOnInit() {
    this.loadLabels();
    this.pageChangeService.getSidebarState().subscribe(value => {
      this.sidebarOpen = value;
    })
    this.pageChangeSubscription = this.pageChangeService.getPage().subscribe((page)=> {
      this.selectedPage = page;
    })
    this.refreshSubscription = this.refreshService.getRefreshTrigger().subscribe(async () => {
      await this.loadLabels();
    })
  }

  private async loadLabels() {
    const response = await this.labelService.getAllLabels();
    if (response?.responseCode == 200) {
      if (response.data){
        this.labelsArray = response.data;
      }
    } else {
      console.log("failed to get labels");
    }
  }

  openEditLabel() {
    const dialogRef = this.matDialog.open(EditLabelsComponent, {
      width: '400px',
      data: this.labelsArray,
    })
    const instance = dialogRef.componentInstance;
    instance.editDataSubject.subscribe((data: EditLabelDataTransferModel) => {
      this.makeEditChanges(data);
    })
  }

  private makeEditChanges(data: EditLabelDataTransferModel) {
    if (data.add && data.id && data.label) {
      const newLabel: Label = {
        id: data.id,
        name: data.label,
        createdAt: new Date()
      }
      this.labelsArray.unshift(newLabel);
    } else if (data.update && data.index && data.index>-1 && data.label && data.label != this.labelsArray[data.index]. name) {
      this.labelsArray[data.index].name = data.label;
    } else if (data.delete && data.index && data.index > -1) {
      this.labelsArray.splice(data.index,1);
    }
  }

  doNothing(){
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onMouseEnterSideBar() {
    await this.delay(500)
    this.sidebarOpen = true;
  }

  onMouseLeaveSideBar() {
    if (!this.pageChangeService.isSideBarOpend()) {
      this.sidebarOpen = false;
    }
  }

}
