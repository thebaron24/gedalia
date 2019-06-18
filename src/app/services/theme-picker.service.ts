import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class ThemePickerService {

	initialClass = 'angular-universal-theme';
  colorClass$: BehaviorSubject<string> = new BehaviorSubject(this.initialClass);

  constructor(private overlayContainer: OverlayContainer) {
      this.colorClass$.next(this.initialClass);
      overlayContainer.getContainerElement().classList.add(this.initialClass);
  }

  getColorClass() {
    return this.colorClass$;
  }

  setColorClass(className: string) {
  	this.overlayContainer.getContainerElement().classList.forEach(css => {
      if(css !== 'cdk-overlay-container') this.overlayContainer.getContainerElement().classList.remove(css);
    });
    this.overlayContainer.getContainerElement().classList.add(className);
    this.colorClass$.next(className);
  }
}
