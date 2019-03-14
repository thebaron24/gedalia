import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Menus } from '../../models/menus.model';
import { MenusStoreService } from '../../services/menus-store.service';
import { PostFilterPipe } from '../../pipes/post-filter.pipe';
import { Observable, Subject, forkJoin}    from 'rxjs';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit, OnDestroy {

	subscriptions: any = {};
	menus$: Observable<Menus> = this.menusStoreService.menus$;

	constructor(public dataService: DataService, public menusStoreService: MenusStoreService) {}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		Object.keys(this.subscriptions).forEach(key => this.subscriptions[key].unsubscribe());
	}

}
