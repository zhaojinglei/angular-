import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'
import { catchError, timeout, tap } from 'rxjs/operators'
import { Observable, of } from "rxjs"

import { NzMessageService } from 'ng-zorro-antd'
import { StorageService } from '../storage/storage.service'
import { Router } from '@angular/router'

// import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    public host: any

    constructor(
        private message: NzMessageService,
        private storage: StorageService,
        private router: Router,
    ) {
        this.host = this.storage.get('host')
    }

    private resultFilter<T>(result: any) {

        if (result.body && (result.body.msg === 'Auth error' || result.body.msg === 'Token error')) {
            this.storage.clear()
            this.router.navigate(['login'])
        }

        return of(result as T)
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: Auth error
            if (error.status === 401) {
                this.storage.clear()
                this.router.navigate(['login'])
                return of(result as T)
            }

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            console.log(`${operation} failed: ${error.message}`);

            // Tip internet error
            this.message.error('网络繁忙,请稍后再试!')

            // Let the app keep running by returning an empty result.
            return of(result as T)
        }
    }

    private parseBody(obj: object): string {
        let account = this.storage.get('account')
        let token = this.storage.get('token')

        if (token) obj['token'] = token

        if (account && account.account_name) obj['account_name'] = account.account_name

        return Object.keys(obj || {}).map(k => `${k}=${obj[k]}`).join('&')
    }

    private setHeaders(req: HttpRequest<any>, next: HttpHandler): HttpRequest<any> {
        return req.clone({
            url: `${this.host}${req.url}`,
            headers: req.headers.set('Content-Type', 'application/x-www-form-urlencoded'),
            withCredentials: false,
            body: this.parseBody(req.body)
        })
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(this.setHeaders(req, next)).pipe(
            timeout(10000),
            tap(res => this.resultFilter(res)),
            catchError(this.handleError())
        )
    }
}