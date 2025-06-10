import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {

  @Output() appClickOutside = new EventEmitter<void>();

  @HostListener('document:click',['$event.target'])
  public onClick(targetElement: HTMLElement) {
    const clickInside = (targetElement as HTMLElement).closest('[appClickOutside]');
    if (!clickInside) {
      this.appClickOutside.emit();
    }
  }

}
