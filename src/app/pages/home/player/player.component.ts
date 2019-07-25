import { Component, OnInit } from "@angular/core";

import { Animations } from "../../../animations";
import { NzMessageService } from "ng-zorro-antd";
import { PlayerService } from "./player.service";
import { StorageService } from "../../../storage/storage.service";
import { Router } from "@angular/router";
import { format } from "date-fns";

@Component({
    selector: "app-home-players",
    templateUrl: "./player.component.html",
    styleUrls: ["./player.component.less"],
    animations: [Animations]
})
export class PlayerComponent implements OnInit {
    constructor(private playerService: PlayerService, private message: NzMessageService, private storage: StorageService, private router: Router) {}

    public less = true;
    public more = true;
    public state: string;
    public show = false;
    public players = [];
    public input: any;
    public proxy = this.storage.get("proxy");

    public loading = false;
    public limit = 10;
    public currentPage = 1;
    public skip = 0;
    public totalPage = Math.ceil((this.proxy!.user_number || 0) / this.limit);
    public allowPage = this.totalPage > 1000 ? 1000 : this.totalPage;

    format(date) {
        return format(date, "YYYY-MM-DD");
    }

    async getData(limit) {
        this.skip = this.limit * (this.currentPage - 1);

        let option = {
            skip: this.skip,
            limit: limit,
            input: parseInt(this.input) || 0
        };

        return await this.playerService.getGameUser(option).toPromise();
    }

    async loadData() {
        this.show = true;
        await new Promise((ok, err) => {
            setTimeout(() => {
                ok();
            }, 300);
        });
        let data = await this.getData(this.limit);
        this.players = data.msg;

        this.show = false;
        this.loading = false;
        this.loading = false;
    }

    async ngOnInit() {
        this.more = this.currentPage < this.allowPage;
        this.less = this.currentPage > 1;
        await this.loadData();
    }

    async search() {
        if (!this.input) {
            return this.message.error("玩家ID不能为空");
        }
        if (!/^\d{9,10}$/.test(this.input)) {
            return this.message.error("玩家ID格式错误");
        }

        this.currentPage = 1;
        this.skip = 0;
        this.more = false;
        this.less = false;
        this.loading = false;
        this.loadData();
        if (!this.input) {
            this.more = this.currentPage < this.allowPage;
            this.less = this.currentPage > 1;
        }
    }

    next() {
        if (this.loading) return false;
        if (!this.more) return false;
        this.loading = true;
        this.currentPage++;
        this.more = this.currentPage < this.allowPage;
        this.less = this.currentPage > 1;
        this.loadData();
    }

    prev() {
        if (this.loading) return false;
        if (!this.less) return false;
        this.loading = true;
        this.currentPage--;
        this.more = this.currentPage < this.allowPage;
        this.less = this.currentPage > 1;
        this.loadData();
    }
}
