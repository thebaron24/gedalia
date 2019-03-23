import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ProgressOverlayComponent } from '../components/progress-overlay/progress-overlay.component';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

	overlayRef;
	progressOverlayPortal;

  resource = 0;

  constructor(private overlay: Overlay) {
  	//this.overlayRef = this.create();
  }

  create() {
  	return this.overlay.create({
	    positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
	    hasBackdrop: true
	  });
  }

  showGlobalOverlay() {
  	if(this.overlayRef && this.overlayRef.hasAttached)
  		this.resource++;
  	else {

  		const overlayRef = this.overlay.create({
		    positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
		    hasBackdrop: true
		  })

		  const progressOverlayPortal = new ComponentPortal(ProgressOverlayComponent);
			overlayRef.attach(progressOverlayPortal);

			this.overlayRef = overlayRef;
			this.progressOverlayPortal = progressOverlayPortal;
  	}
  }

  hideGlobalOverlay() {
  	if (this.resource) {
  		this.resource--;
  	} else if (this.overlayRef && this.overlayRef.hasAttached) {
			this.overlayRef.detach();
			//this.overlayRef.dispose(); //closes but never would open again
			// this.overlayRef.close();
			console.log("tried to detach");
  	}
  }
}
