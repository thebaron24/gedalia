import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ProgressOverlayComponent } from '../components/progress-overlay/progress-overlay.component';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  constructor(private overlay: Overlay) { }

  showGlobalOverlay() {
    let o = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true
    }).attach(new ComponentPortal(ProgressOverlayComponent));
  }
}
