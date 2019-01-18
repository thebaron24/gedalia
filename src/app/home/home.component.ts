import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../data.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	page: any[];

	constructor(private dataService: DataService) {}

	ngOnInit(): void {
		console.log("HomeComponent: OnInit firing");
		this.dataService.page$.pipe(takeUntil(this.destroyed$)).subscribe(page => {
			console.log("HomeComponent: page received - ", page)
			this.page = page;
		});
	}

	ngOnDestroy(): void {
		console.log("HomeComponent: OnDestroy firing");
		this.destroyed$.next(true);
    this.destroyed$.complete();
	}

}
