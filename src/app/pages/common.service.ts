import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CommonService {
    constructor(private http: HttpClient) {}

    getPackageInfo(data): Observable<any> {
        return this.http.post("/proxy/getpackageinfo", data);
    }

    getProxyUser(): Observable<any> {
        return this.http.post("/proxy/getproxyuser", {});
    }

    getProxyRule(): Observable<any> {
        return this.http.post("/proxy/getproxyrule", {});
    }

    setProxyRule(data): Observable<any> {
        return this.http.post("/proxy/setproxyrule", data);
    }

    getStatement(data: any): Observable<any> {
        return this.http.post("/statement/getstatement", data);
    }

    getProxyUserInduction(): Observable<any> {
        return this.http.post("/induction/getProxyUserInduction", {});
    }

    getProxyUserInductionHistory(): Observable<any> {
        return this.http.post("/induction/getProxyUserInductionHistory", {});
    }

    getProxyUserInductionHistoryByDates(data: any): Observable<any> {
        return this.http.post("/induction/getProxyUserInductionHistoryByDates", data);
    }

    getGameUserInductionHistoryByDates(data: any): Observable<any> {
        return this.http.post("/induction/getGameUserInductionHistoryByDates", data);
    }
}
