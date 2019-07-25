import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})

export class StorageService {

	prefix = 'proxy'

	get(key: string, fn?: Function): any {
		key = `${this.prefix}-${key}`
		let res = JSON.parse(localStorage.getItem(key) || null)
		fn && fn(res)
		return res
	}

	set(key: string, value: any, fn?: Function) {
		key = `${this.prefix}-${key}`
		localStorage.setItem(key, JSON.stringify(value || {}))
		fn && fn()
	}

	remove(key: string, fn?: Function) {
		key = `${this.prefix}-${key}`
		localStorage.removeItem(key)
		fn && fn()
	}

	clear(fn?: Function) {
		localStorage.clear()
		fn && fn()
	}
}
