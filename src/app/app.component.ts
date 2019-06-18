import { Component } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ThemePickerService } from './services/theme-picker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: { '[class]': 'themeClass'}
})
export class AppComponent implements OnInit, OnDestroy {
  logo = 'Gedalia';
  mobileQuery: MediaQueryList;
  $theme = this.themePicker.getColorClass();
  themeClass;

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private themePicker: ThemePickerService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.$theme = this.themePicker.getColorClass();
  }

  pickColor(theme: string) {
    this.themePicker.setColorClass(theme);
  }

  ngOnInit(): void {
    this.$theme.subscribe((theme) => {
      this.themeClass = theme;
    })
  }

  ngOnDestroy(): void {
    this.$theme.unsubscribe();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
