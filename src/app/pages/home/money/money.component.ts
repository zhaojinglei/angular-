import { Component, OnInit } from "@angular/core";

import { Animations } from "../../../animations";

import { format, eachDay, getTime } from "date-fns";
import { CommonService } from "../../common.service";
import { NzMessageService } from "ng-zorro-antd";
import { Cache } from "../../../storage/cache.service";
import { StorageService } from "src/app/storage/storage.service";

@Component({
    selector: "app-home-money",
    templateUrl: "./money.component.html",
    styleUrls: ["./money.component.less"],
    animations: [Animations]
})
export class MoneyComponent implements OnInit {
    constructor(private commonService: CommonService, private message: NzMessageService, private cache: Cache, private storage: StorageService) {}

    public proxy = this.storage.get("proxy");
    // 动画参数
    public state: string;
    // 今天
    public today = format(new Date(), "YYYY-MM-DD");
    // 开始时间
    public startDate = new Date();
    // 结束时间
    public endDate = this.startDate;
    // 日期队列
    public dateQueue = [];
    // 当前查找日期
    public currentDate = "";
    // 账户类型
    public accountType = { "1": "正式账号", "2": "测试账号", "3": "机器人" };
    // 搜索类型
    public searchTypes = [{ name: "全部类型", key: "" }, { name: "ID查找", key: "child_id" }, { name: "昵称查找", key: "child_nick" }];
    // 当前搜索类型
    public currentSearchName = "全部类型";
    public currentSearchType = this.searchTypes[0];
    // 数据源
    public panels = [];
    // 最后id 用来排序
    public lastId = "";
    // 是否开始请求
    public isLoadingOne = false;
    // 是否还有更多数据
    public isMore = true;
    // 每次请求多少条
    public limit = 10;
    // 按钮内容
    public loadingTips = "加载更多";
    // 输入内容
    public input = "";
    // 日期历史收益
    public dateProxyUserIncome: any;
    public dateGameUserIncome: any;

    public showIncome: any;
    public showTotal: any;
    public showTimes: any;

    async loadOne() {
        if (this.dateQueue.length < 1) return this.message.error("请选择时间!");
        this.isLoadingOne = true;
        //  强制延时一秒 降低操作频率
        setTimeout(async () => {
            await this.loadData();
            this.isLoadingOne = false;
        }, 300);
    }

    clear() {
        this.panels = [];
        this.currentDate = this.dateQueue[0];
        this.isMore = true;
        this.isLoadingOne = false;
        this.lastId = "";
        this.loadingTips = "加载更多";
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

        if (this.input) {
            if (/[&\|\\\*^%$#@\-]/.test(this.input)) {
                this.message.error("非法字符");
                return false;
            }
        }

        this.dateQueue = eachDay(this.startDate, this.endDate)
            .map(e => format(e, "YYYY-MM-DD"))
            .reverse();

        if (this.dateQueue.length > 31) {
            this.dateQueue = [];
            this.startDate = new Date();
            this.endDate = new Date();
            this.message.error("查询区间不能超过31天");
            return false;
        }

        this.currentDate = this.dateQueue[0];

        return true;
    }

    format(date) {
        return format(date, "YYYY-MM-DD HH:mm:ss");
    }

    onStartDateChange(date) {
        this.startDate = date;
        this.getDateQueue();
    }

    onEndDateChange(date) {
        this.endDate = date;
        this.getDateQueue();
    }

    changeSearchType(event) {
        let name = event.target.value;
        let index = this.searchTypes.findIndex(e => e.name === name);
        this.currentSearchType = this.searchTypes[index];
        console.log(this.currentSearchType);
    }

    search() {
        if (!this.getDateQueue()) {
            return false;
        }
        this.clear();
        this.start();
    }

    async getData(limit) {
        let option = {
            last_id: this.lastId,
            limit: limit,
            dates: JSON.stringify(this.dateQueue),
            key: this.currentSearchType.key,
            input: this.input || ""
        };

        let data = await this.commonService.getStatement(option).toPromise();

        return { data };
    }

    async loadData() {
        this.isMore = false;

        let response = await this.getData(this.limit);

        let data = response.data;

        if (!data || !data.msg || data.msg.length === 0) {
            this.isMore = false;
            this.loadingTips = "没有更多啦";
            return false;
        }

        this.panels = this.panels.concat(data.msg);

        this.lastId = data.msg[data.msg.length - 1]._id;

        if (data.msg.length < this.limit) {
            this.isMore = false;
            this.loadingTips = "没有更多啦";
            return false;
        }

        this.isMore = true;
    }

    loadIncome() {
        this.commonService
            .getProxyUserInductionHistoryByDates({ dates: JSON.stringify(this.dateQueue), ids: JSON.stringify([this.proxy.id]) })
            .subscribe(data => {
                if (!data.msg) return;
                this.dateProxyUserIncome = data.msg[this.proxy.id];
            });

        this.commonService
            .getGameUserInductionHistoryByDates({ dates: JSON.stringify(this.dateQueue), ids: JSON.stringify([this.proxy.id]) })
            .subscribe(data => {
                if (!data.msg) return;
                this.dateGameUserIncome = data.msg[this.proxy.id];
            });
    }

    start() {
        this.getDateQueue();
        this.currentDate = this.dateQueue[0];
        this.loadData();
        this.loadIncome();
    }

    ngOnInit() {
        this.start();
    }

    parseNumber(number) {
        return number ? number : 0;
    }
}
