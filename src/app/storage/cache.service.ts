import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})

export class Cache {

    constructor(
        private storage: StorageService
    ) { }

    setStatementCacheList(value: string) {
        let list = this.storage.get('statementCacheList') || []

        if (!list.find(e => e === value)) {
            list.push(value)
        }

        if (list.length > 100) {
            let key = list.shift()
            this.removeStatementCache(key)
        }

        this.storage.set('statementCacheList', list)
    }

    setStatementCache(key: string, value: any, fn?: Function): void {
        this.storage.set(key, value)
        fn && fn()
    }

    getStatementCache(key: string, fn?: Function): any {
        return this.storage.get(key, fn)
    }

    removeStatementCache(key: string) {
        return this.storage.remove(key)
    }
}
