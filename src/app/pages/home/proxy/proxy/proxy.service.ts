import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class ProxyService {
    constructor(private http: HttpClient) {}

    getProxyUserChilds(data: any): Observable<any> {
        return this.http.post("/proxy/getproxyuserchilds", data);
    }
}
