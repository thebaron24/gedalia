import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DataService } from '../data.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	page: any[];

	constructor(private dataService: DataService) {
		console.log("HomeComponent: Constructor firing");
		this.dataService.page$.pipe(takeUntil(this.destroyed$)).subscribe(page => {
			console.log("HomeComponent: page received - ", page)
			this.page = page;
		});
	}

	ngOnInit(): void {
		console.log("HomeComponent: OnInit firing");
	}

	ngAfterViewInit() {
		console.log("HomeComponent: AfterViewInit firing");
	}

	ngOnDestroy(): void {
		console.log("HomeComponent: OnDestroy firing");
		// this.destroyed$.next(true);
  //   this.destroyed$.complete();
	}

}
