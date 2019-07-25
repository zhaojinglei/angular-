import { Component, OnInit } from "@angular/core";
import { Animations } from "../../../../animations";
import { Router, ActivatedRoute } from "@angular/router";
import { StorageService } from "../../../../storage/storage.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { CommonService } from "src/app/pages/common.service";
import { windowToggle } from "rxjs/operators";

@Component({
    selector: "app-home-proxy-income",
    templateUrl: "./income.component.html",
    styleUrls: ["./income.component.less"],
    animations: [Animations]
})
export class IncomeComponent implements OnInit {
    public state: any;

    public currentIncome = this.storage.get("currentIncome");

    public proxyRule = this.storage.get("proxyRule");

    public currentIncomeValue: any;

    public isVisible = false;

    public inputNumber: any;

    public index: any;

    public loading = false;

    public situation: any;

    public proxy = this.storage.get("proxy");

    public nzDisabled = false;
    public max_numberBeforeChange: any = ''
    public _currentIncome:any=this.currentIncome.income
    public afterChangeIncome:any=''
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private storage: StorageService,
        private message: NzMessageService,
        private commonService: CommonService,
        private modalService: NzModalService
    ) {
        let id = this.activatedRoute.snapshot.queryParams.id;

        if (!id) this.router.navigate(["home/proxy/index"]);
    }

    changeIncomeValue(index) {
        let i = this.proxyRule.situation.findIndex(e => e.max === this.currentIncomeValue);
        if (this.proxyRule.situation[i].left_number !== -1) this.proxyRule.situation[i].left_number += 1;

        this.currentIncomeValue = this.proxyRule.situation[index].max;
        this.currentIncome.proxy_rule.income = this.currentIncomeValue;
        if (this.proxyRule.situation[index].left_number !== -1) this.proxyRule.situation[index].left_number -= 1;
    }
    changeIncomeValueConfirm(beforeChange, afterChange, index) {
        this.modalService.confirm({
            nzTitle: "更改分成档位",
            nzContent: `
            <br>
            调整前：${beforeChange}%
            <br>
            调整后：${afterChange}%
            <br>
            确定要更改吗?
            <br>
            `,
            nzOkText: "确定",
            nzCancelText: "取消",
            nzOnOk: () => {
                this.changeIncomeValue(index);
                this.afterChangeIncome=afterChange;
                this.onSubmitIncomeValue();
            }
        });
    }


    showModal(index) {
        this.inputNumber = "";
        this.isVisible = true;
        this.index = index;
    }

    handleOk() {
        this.isVisible = false;
        if (/\D/.test(this.inputNumber)) {
            return this.message.error("请输入整数!");
        }

        let number = parseInt(this.inputNumber);

        if (!number && number !== 0) {
            return this.message.error("输入不能为空!");
        }
    }

    handleCancel() {
        this.isVisible = false;
    }

    onSave() {
        this.modalService.confirm({
            nzTitle: `更改${this.currentIncome.proxy_rule.situation[this.index].min}%分成档位的代理配额`,
            nzContent: `
            <br>
            调整前：
            ${this.max_numberBeforeChange}
            <br>
            调整后：
            ${parseInt(this.inputNumber)}
            <br>
            确定要更改 ${this.currentIncome.proxy_nick} 的配额吗?
            <br>
            `,
            nzOkText: "确定",
            nzCancelText: "取消",
            nzOnOk: () => {
                let number = parseInt(this.inputNumber);
                // 上一次的数据
                let total = this.currentIncome.proxy_rule.situation[this.index].max_number;
                // 代理配额
                this.currentIncome.proxy_rule.situation[this.index].max_number = number;
                // 代理的剩余
                this.currentIncome.proxy_rule.situation[this.index].left_number += number - total;
                // 我的配置
                this.proxyRule.situation[this.index].left_number -= number - total;
                this.onSubmit();
            }
        });
    }
    async onSubmitIncomeValue(){
        if (JSON.stringify(this.storage.get("currentIncome").proxy_rule) === JSON.stringify(this.currentIncome.proxy_rule)) {
            return this.message.info(`没有变化`);
        }
        let loadId = this.message.loading("正在请求...");

        this.loading = true;

        let incomeRule = this.currentIncome.proxy_rule;

        await new Promise((ok, err) => {
            setTimeout(() => {
                ok();
            }, 300);
        });
        let data = await this.commonService
            .setProxyRule({
                change_rule: JSON.stringify(incomeRule)
            })
            .toPromise();

        this.loading = false;

        if (data.code === 200) {
            this.storage.set("proxyRule", this.proxyRule);
            this.storage.set("currentIncome", this.currentIncome);
            this.message.success("设置成功");
            this._currentIncome=this.afterChangeIncome
        } else {
            console.log(data);
            this.message.error(`设置失败${data.code}`);
        }
        this.message.remove(loadId.messageId);
    }
    
    async onSubmit() {
        if (JSON.stringify(this.storage.get("currentIncome").proxy_rule) === JSON.stringify(this.currentIncome.proxy_rule)) {
            return this.message.info(`没有变化`);
        }

        let loadId = this.message.loading("正在请求...");

        this.loading = true;

        let incomeRule = this.currentIncome.proxy_rule;

        await new Promise((ok, err) => {
            setTimeout(() => {
                ok();
            }, 300);
        });

        // console.log(incomeRule);

        let data = await this.commonService
            .setProxyRule({
                change_rule: JSON.stringify(incomeRule)
            })
            .toPromise();

        this.loading = false;

        if (data.code === 200) {
            this.storage.set("proxyRule", this.proxyRule);
            this.storage.set("currentIncome", this.currentIncome);
            this.message.success("设置成功");
        } else {
            console.log(data);
            this.message.error(`设置失败${data.code}`);
            this._currentIncome=this.afterChangeIncome||this.currentIncome.income
            if (this.currentIncome.proxy_rule.situation[this.index]) {
                let number = this.max_numberBeforeChange;
                // 上一次的数据
                let total = this.currentIncome.proxy_rule.situation[this.index].max_number;
                // 代理配额
                this.currentIncome.proxy_rule.situation[this.index].max_number = number;
                // 代理的剩余
                this.currentIncome.proxy_rule.situation[this.index].left_number += number - total;
                // 我的配置
                this.proxyRule.situation[this.index].left_number -= number - total;
            }
        }
        this.message.remove(loadId.messageId);
    }

    backToProxy() {
        this.router.navigate(["/home/proxy/index"]);
    }

    reset() {
        this.start();
    }

    start() {
        this.currentIncomeValue = this.currentIncome.proxy_rule.income;
        if (this.proxy.proxy_pid === 0) {
            this.nzDisabled = true;
            // this.changeIncomeValue(1);

            if (this.currentIncome.proxy_rule.situation[2].max_number === 0) {
                this.inputNumber = 5;
                this.index = 2;
                this.handleOk();
            }

            if (this.currentIncome.proxy_rule.situation[3].max_number === 0) {
                this.inputNumber = 25;
                this.index = 3;
                this.handleOk();
            }

            if (this.currentIncome.proxy_rule.situation[4].max_number === 0) {
                this.inputNumber = 125;
                this.index = 4;
                this.handleOk();
            }
        }
    }

    ngOnInit() {
        this.start();
    }
}
