import { Component, isDevMode } from '@angular/core'

import { Router, NavigationEnd } from '@angular/router'

import { filter } from "rxjs/operators";
import { StorageService } from './storage/storage.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {

	constructor(
		private router: Router,
		private storage: StorageService
	) {
		if (!isDevMode()) this.storage.clear()
		this.activeRouter(this.router.url)
	}

	public prveRouter: string = '/login'

	activeRouter(url) {
		if (url === '/login') {
			if (this.storage.get('account')) this.router.navigate([this.prveRouter])
		} else {
			if (!this.storage.get('account')) this.router.navigate(['/login'])
		}
		this.prveRouter = url
	}

	ngOnInit() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: any) => {
			this.activeRouter(event.url)
		})
	}
}
