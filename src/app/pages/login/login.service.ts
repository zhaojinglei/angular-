import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class LoginService {

	constructor(private http: HttpClient) { }

	login(userInfo: object): Observable<any> {
		return this.http.post("/login/login", userInfo)
	}

	getCaptcha(): Observable<any> {
		return this.http.post('/captcha/create', {})
	}

	loginout(): Observable<any> {
		return this.http.post("/login/loginout", {})
	}
}
