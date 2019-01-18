import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
//import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

	page: any[];

  constructor(private dataService: DataService,
  						private router: Router) {
    this.dataService.page$.subscribe(page => {
      console.log("PageComponent: page received - ", page);
      if(page.length) this.page = page;
      else this.router.navigateByUrl('/404');
    });
  }

  ngOnInit() {}

}
