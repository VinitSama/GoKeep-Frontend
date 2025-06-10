import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { AuthenticationService } from '../../services/authentication.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { PageChangeService } from '../../services/page-change.service';
import { SearchService } from '../../services/search.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbar,
    MatIconModule,
    MatButtonModule,
    ClickOutsideDirective,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  searchTerm: string = '';
  isSearchFocus: boolean = false;
  cloudIcon: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private refreshService: RefreshService,
    private pageChangeService: PageChangeService,
    private searchService: SearchService,
  ) {}

  logout() {
    this.authService.logout();
  }

  async refreshPage() {
    this.onClose();
    this.refreshService.triggerRefresh();
    this.cloudIcon = true;
    await this.delay(2000);
    this.cloudIcon = false;
  }

  doNothing(){
  }

  toggleSidebar() {
    this.pageChangeService.toggleSidebar();
  }

  updateSearchTerm() {
    this.searchService.updateSearchTerm(this.searchTerm);
  }

  onFocus() {
    this.isSearchFocus = true;
  }

  async outFocus() {
    await this.delay(500);
    this.isSearchFocus = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onClose() {
    this.searchTerm = '';
    this.updateSearchTerm();
    this.outFocus();
  }

}
