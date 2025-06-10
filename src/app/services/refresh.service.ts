import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private refreshSubject = new Subject<any>();
  
  constructor() { }
  
  triggerRefresh() {
    this.refreshSubject.next(1);
  }

  getRefreshTrigger() {
    return this.refreshSubject;
  }

}
