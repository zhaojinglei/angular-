import { Component, OnInit } from "@angular/core";

import { Animations } from "../../../animations";

import { Router } from "@angular/router";

import { StorageService } from "../../../storage/storage.service";
import { ClientMessage } from "src/app/client/client";
import { NzMessageService } from "ng-zorro-antd";
import { LoginService } from "../../login/login.service";

@Component({
    selector: "app-home-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.less"],
    animations: [Animations]
})
export class HomeComponent implements OnInit {
    constructor(
        private router: Router,
        private storage: StorageService,
        private clientMessage: ClientMessage,
        private loginService: LoginService,
        private message: NzMessageService
    ) {}

    public buttomTitles: any = [
        { title: "推广注册", path: "home/index" },
        { title: "团队管理", path: "home/proxy" },
        { title: "收益明细", path: "home/money" }
        // { title: "玩家", path: "home/player" }
    ];
    public state: string;

    public buttomSelect: string = this.storage.get("selectRouter") || "home/index";

    public getTitle(path: string): string {
        return this.buttomTitles.find(e => e.path === path).title;
    }

    backToHall() {
        this.clientMessage.send("__backtohall", {}, null);
    }

    ngOnInit() {
        this.router.navigate([this.buttomSelect]);
        this.clientMessage.send("__done", {}, null);
    }

    selectIndex(i) {
        this.storage.set("selectRouter", this.buttomTitles[i].path, () => {
            this.router.navigate([this.buttomTitles[i].path]);
        });
    }

    loginout() {
        this.loginService.loginout().subscribe(data => {
            if (data.code !== 200) return this.message.error(data.msg);
            this.storage.clear();
            this.router.navigate(["login"], { queryParams: { loginout: true } });
            return this.message.success("注销成功");
        });
    }
}
