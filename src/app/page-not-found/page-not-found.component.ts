import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit, OnDestroy {

  constructor() {
  	console.log("PageNotFoundComponent: constructor firing");
  }

  ngOnInit(): void {
  	console.log("PageNotFoundComponent: OnInit firing");
  }

  ngOnDestroy(): void {
  	console.log("PageNotFoundComponent: OnDestroy firing");
  }

}
