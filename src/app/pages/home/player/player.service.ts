import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class PlayerService {

    constructor(private http: HttpClient) { }

    getGameUser(data: any): Observable<any> {
        return this.http.post("/gameUser/getGameUser", data)
    }
}
