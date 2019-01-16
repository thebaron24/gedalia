import { Component } from '@angular/core';
import { DataService } from './data.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataService]
})
export class AppComponent implements OnDestroy {
  title = 'Baron Wilson';
  pages: any[];
  posts: any[];

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  constructor(private dataService: DataService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    dataService.pages$.subscribe(pages => {this.pages = pages});
    dataService.posts$.subscribe(posts => {this.posts = posts});

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
