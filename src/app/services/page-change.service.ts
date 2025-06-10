import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageChangeService {

  private page = new Subject<string>();
  private sidebarOpen$ = new BehaviorSubject<boolean>(true);

  constructor() { 
    this.page.next("firstPage");
  }

  changePage(pageName: 'firstPage' | 'archive' | 'trash' | string) {
    this.page.next(pageName);
  }

  getPage() {
    return this.page;
  }

  toggleSidebar() {
    this.sidebarOpen$.next(!this.sidebarOpen$.value);
  }

  getSidebarState() {
    return this.sidebarOpen$.asObservable();
  }

  isSideBarOpend() {
    return this.sidebarOpen$.value;
  }

}
