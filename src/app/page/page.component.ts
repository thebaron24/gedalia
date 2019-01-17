import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [DataService]
})
export class PageComponent implements OnInit {

	page: any[] = [];

  constructor(private dataService: DataService,
  						private route: ActivatedRoute,
  						private router: Router) {
  	dataService.page$.subscribe(page => {
  		if(page.length) this.page.push(page[0]);
      else this.router.navigate(['/404']);
  	});
  	dataService.config$.subscribe(config => {
      console.log("config is loaded - fetching page");
      dataService.getPage(this.router.url);
    });
  }

  ngOnInit() {
  }

}
