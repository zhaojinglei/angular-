import { Component, OnInit } from "@angular/core";

import { Animations } from "../../../../animations";
import { ProxyService } from "./proxy.service";
import { StorageService } from "../../../../storage/storage.service";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { format, eachDay } from "date-fns";
import { CommonService } from "src/app/pages/common.service";
import { ProxyUserInduction } from "src/app/interface/ProxyUserInduction";
import { ProxyUser } from "src/app/interface/ProxyUser";
import { GameUserInduction } from "src/app/interface/GameUserInduction";

@Component({
    selector: "app-home-proxy-proxy",
    templateUrl: "./proxy.component.html",
    styleUrls: ["./proxy.component.less"],
    animations: [Animations]
})
export class ProxyComponent implements OnInit {
    constructor(
        private proxyService: ProxyService,
        private storage: StorageService,
        private router: Router,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    public state: string;

    public query = {};

    // 搜索类型
    public searchTypes = [
        { name: "搜索类型 v", key: "all" },
        { name: "角色ID", key: "proxy_user_id" },
        { name: "代理昵称", key: "proxy_nick" },
        { name: "代理账号", key: "role_name" }
    ];
    // 当前搜索类型
    public currentSearchType = this.searchTypes[0];
    public currentSearchName = "搜索类型 v";
    // input
    public input = "";
    // 数据源
    public proxys = [];

    public proxyUser = this.storage.get("proxy");

    public proxyRule = this.storage.get("proxyRule");

    public show = true;
    public more = false;
    public less = false;
    public loading = false;
    // limit
    public limit = 10;
    public currentPage = 1;
    public skip = 0;
    public total = this.proxyUser.user_number;
    public totalPage = Math.ceil((this.total || 0) / this.limit);
    public allowPage = this.totalPage > 1000 ? 1000 : this.totalPage;

    // 开始时间
    public startDate = new Date();
    // 结束时间
    public endDate = this.startDate;

    public dateQueue = [];

    public proxyUserinductions: ProxyUserInduction[] = [];

    public gameUserinductions: GameUserInduction[] = [];

    public darwerVisible = false;

    public placement = "bottom";

    public selectProxyUserInduction: ProxyUserInduction = {} as ProxyUserInduction;
    public selectGameUserInduction: GameUserInduction = {} as GameUserInduction;

    public selectProxyUser: any = {};

    public proxyPid = this.proxyUser.id;

    public sort = "team_number";

    public proxyUserChildrenQueue: any[] = [];

    init() {
        this.currentPage = 1;
        this.skip = 0;
        this.more = false;
        this.less = false;
        this.loading = false;
        this.more = this.currentPage < this.allowPage;
        this.less = this.currentPage > 1;
    }

    search() {
        if (!this.input && this.currentSearchType.key !== "all") {
            return this.message.error("输入不能为空!");
        }
        this.query = {};
        this.query[this.currentSearchType.key] = parseInt(this.input) || this.input;
        this.init();
        this.loadData();
        if (!this.input) {
            this.more = this.currentPage < this.allowPage;
            this.less = this.currentPage > 1;
        }
    }

    changeSearchType(event) {
        let name = event.target.value;
        let index = this.searchTypes.findIndex(e => e.name === name);
        this.currentSearchType = this.searchTypes[index];
    }

    transfer(id) {
        this.storage.set("currentIncome", this.proxys.find(e => e.id === id));
        this.router.navigate(["home/proxy/transfer"], { queryParams: { id } });
    }

    income(id) {
        this.storage.set("currentIncome", this.proxys.find(e => e.id === id));
        this.router.navigate(["home/proxy/income"], { queryParams: { id } });
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

    async getData(limit) {
        this.skip = this.limit * (this.currentPage - 1);
        let option = {
            limit: limit,
            skip: this.skip,
            sort: this.sort
        };

        let data = await this.proxyService.getProxyUserChilds(Object.assign({ proxy_pid: this.proxyPid }, option, this.query)).toPromise();
        return data;
    }

    async loadData() {
        this.show = true;
        await new Promise((ok, err) => {
            setTimeout(() => {
                ok();
            }, 300);
        });
        let data = await this.getData(this.limit);
        this.proxys = data.msg;

        this.show = false;
        this.loading = false;

        this.getProxyUserInductionHistoryByDates();

        this.getGameUserInductionHistoryByDates();
    }

    async ngOnInit() {
        this.more = this.currentPage < this.allowPage;
        this.less = this.currentPage > 1;
        this.getDateQueue();
        await this.loadData();
    }

    onStartDateChange(date) {
        this.getDateQueue();
    }

    onEndDateChange(date) {
        this.getDateQueue();
    }

    getDateQueue() {
        let startDate = format(this.startDate, "YYYY-MM-DD");
        let endDate = format(this.endDate, "YYYY-MM-DD");
        let nowDate = format(new Date(), "YYYY-MM-DD");

        if (!this.startDate || !this.endDate) {
            this.dateQueue = [];
            this.startDate = new Date();
            this.endDate = new Date();
            this.message.error("请选择日期");
            return false;
        }

        if (endDate < startDate) {
            this.dateQueue = [];
            this.startDate = new Date();
            this.endDate = new Date();
            this.message.error("结束日期不能比开始日期小");
            return false;
        }

        if (nowDate < endDate) {
            this.dateQueue = [];
            this.startDate = new Date();
            this.endDate = new Date();
            this.message.error("结束日期不能超过现在");
            return false;
        }

        this.dateQueue = eachDay(this.startDate, this.endDate)
            .map(e => format(e, "YYYY-MM-DD"))
            .reverse();

        if (this.dateQueue.length > 31) {
            this.dateQueue = [startDate];
            this.startDate = new Date();
            this.endDate = new Date();
            this.message.error("查询区间不能超过31天");
            return false;
        }

        console.log(this.dateQueue);
    }

    getProxyUserInductionHistoryByDates() {
        this.commonService
            .getProxyUserInductionHistoryByDates({ dates: JSON.stringify(this.dateQueue), ids: JSON.stringify(this.proxys.map(e => e.id)) })
            .subscribe(data => {
                if (!data || !data.msg) return;
                this.proxyUserinductions = data.msg;
                console.log(this.proxyUserinductions);
            });
    }

    getGameUserInductionHistoryByDates() {
        this.commonService
            .getGameUserInductionHistoryByDates({ dates: JSON.stringify(this.dateQueue), ids: JSON.stringify(this.proxys.map(e => e.id)) })
            .subscribe(data => {
                if (!data || !data.msg) return;
                this.gameUserinductions = data.msg;
            });
    }

    showDetails(id) {
        this.selectProxyUserInduction = this.proxyUserinductions[id];
        this.selectGameUserInduction = this.gameUserinductions[id];
        this.selectProxyUser = this.proxys.find(e => e.id === id);
        this.open();
    }

    public open() {
        this.darwerVisible = true;
    }

    public close() {
        this.darwerVisible = false;
    }

    parseNumber(number) {
        return number ? number : 0;
    }

    sortByTeamNumber() {
        this.sort = "team_number";
        this.init();
        this.loadData();
    }

    sortByIncome() {
        this.sort = "income";
        this.init();
        this.loadData();
    }

    searchProxyUserChildren(id, total) {
        if (total === 0) return this.message.warning("该代理没有下级啦!");

        this.proxyUserChildrenQueue.push({ id: this.proxyPid, total: this.total });

        this.total = total;
        this.proxyPid = id;
        this.totalPage = Math.ceil((this.total || 1) / this.limit);
        this.allowPage = this.totalPage > 1000 ? 1000 : this.totalPage;
        this.init();

        this.loadData();
    }

    searchProxyUserChildrenBack() {
        if (this.proxyUserChildrenQueue.length === 0) return false;

        let { id, total } = this.proxyUserChildrenQueue.pop();

        if (this.proxyUserChildrenQueue.length === 0) {
            this.proxyPid = this.proxyUser.id;
            this.totalPage = Math.ceil((this.proxyUser.user_number || 1) / this.limit);
            this.allowPage = this.totalPage > 1000 ? 1000 : this.totalPage;
            this.init();
            this.loadData();
            return;
        }

        this.proxyPid = id;
        this.totalPage = Math.ceil((total || 1) / this.limit);
        this.allowPage = this.totalPage > 1000 ? 1000 : this.totalPage;
        this.init();
        this.loadData();
    }
}
