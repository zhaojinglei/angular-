import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class IndexService {
    constructor(private http: HttpClient) {}

    qrcode(url: string): Observable<any> {
        return this.http.post("/proxy/qrcode", { entry_url: url }, { responseType: "blob" });
    }

    moveBalanceToGame(money: number): Observable<any> {
        return this.http.post("/proxy/movebalancetogame", { money });
    }

    regin(data): Observable<any> {
        return this.http.post("/proxy/regin", data);
    }
}
