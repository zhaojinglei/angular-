import { Component, OnInit, ElementRef } from "@angular/core";

import { Animations } from "../../../animations";

import { Router } from "@angular/router";

// import * as html2canvas from 'html2canvas';
import  html2canvas from 'html2canvas';

// import { format } from "date-fns";
import { IndexService } from "./index.service";
import { StorageService } from "../../../storage/storage.service";
import { CommonService } from "../../common.service";
import { NzMessageService } from "ng-zorro-antd";
import { ClientMessage } from "src/app/client/client";
import { ProxyUser } from "src/app/interface/ProxyUser";

@Component({
    selector: "app-home-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.less"],
    animations: [Animations]
})
export class IndexComponent implements OnInit {
    array = [require("../../../../assets/bg.jpg"), require("../../../../assets/bg2.jpg"),require("../../../../assets/bg3.jpg"),require("../../../../assets/bg4.jpg")];
    effect = 'scrollx';
    loading: any;
    isPosterShow: boolean = false;

    constructor(
        private router: Router,
        private indexService: IndexService,
        private storage: StorageService,
        private commonService: CommonService,
        private message: NzMessageService,
        private clientMessage: ClientMessage,
        private el: ElementRef
    ) { }

    // 注册标记
    public isRegin = 1;
    public isReginQrcode: any;
    public isReginUniqueId: number;
    // 自动注册标记
    public noRegin = 2;
    public noReginQrcode: any;
    public noReginUniqueId: number;
    // 网页版标记
    public pcRegin = 3;
    public pcReginQrcode: any;
    public pcReginUniqueId: number;

    public darwerVisible = false;

    public modalVisible = false;

    public placement = "bottom";

    public state: string;

    public account = this.storage.get("account");

    public package = this.storage.get("package");

    public os = this.storage.get("os");

    public proxyRule: any;

    public showURL = ``;

    public proxyUser: ProxyUser = {} as ProxyUser;

    public induction: any;

    public defaultUniqueId: number;

    public inputMoney: number;

    public reginStatus = this.isRegin;

    public entryHost = "";

    public sourceHost = "";

    public nzDisabled = false;

    // 创建账号
    public packageName = "";
    public isCreateAccount = false;
    public selectOS = "";
    public apkDownUrl = "";
    public selectUnqued = 0;
    public roleName = "";
    public nickName = "";
    public passWord = "";
    public passWordRepeat = "";

    public async autoRegin() {
        this.nickName = "VIP" + (100000 + Math.floor(Math.random() * 900000));

        if (!this.roleName.trim()) {
            return this.message.error("用户名不能为空");
        }

        if (this.roleName.length < 6) {
            return this.message.error("用户名太短,最小为6位");
        }

        if (this.roleName.length > 12) {
            return this.message.error("用户名太长,最大为12位");
        }

        if (!/^[a-zA-Z_][a-zA-Z0-9_]+$/.test(this.roleName)) {
            return this.message.error("用户名必须字母开头,且只能为数字,字母,下划线");
        }

        if (!/^[a-zA-Z0-9_]+$/.test(this.nickName)) {
            return this.message.error("昵称只能为数字,字母,下划线");
        }

        if (this.nickName.length < 4) {
            return this.message.error("昵称太短!(最多12个字符)");
        }

        if (this.nickName.length > 12) {
            return this.message.error("昵称太长!(最多12个字符)");
        }

        if (/[^\x00-\xff]/.test(this.passWord)) {
            return this.message.error("密码中包含非法字符");
        }

        if (this.passWord.length < 6) {
            return this.message.error("密码太短");
        }

        if (this.passWord.length > 18) {
            return this.message.error("密码太长");
        }

        if (this.passWord !== this.passWordRepeat) {
            return this.message.error("两次密码输入不一致");
        }

        this.loading = this.message.loading("正在注册...");
        await new Promise((r, j) => setTimeout(() => r(), 500));

        this.indexService
            .regin({
                game_nick: this.nickName,
                account_pass: this.passWord,
                role_name: this.roleName,
                unique_id: this.proxyRule.situation.find(e => e.min === parseInt(this.selectUnqued as any)).unique_id,
                os: this.selectOS,
                package_name: this.packageName,
                uuid: (Math.random() * Date.now())
                    .toString(16)
                    .replace("0", "")
                    .replace(".", "")
            })
            .subscribe(response => {
                if (response.code !== 200) {
                    switch (response.code) {
                        case 531:
                            return this.error("UUID不能为空,请向上级代理索取最新链接!");
                        case 532:
                            return this.error("OS不能为空,请向上级代理索取最新链接!");
                        case 533:
                            return this.error("PACKAGE不能为空,请向上级代理索取最新链接!");
                        case 534:
                            return this.error("代理CODE不能为空,请向上级代理索取最新链接!");
                        case 535:
                            return this.error("代理等级不能为空,请向上级代理索取最新链接!");
                        case 536:
                            return this.error("昵称不能为空!");
                        case 537:
                            return this.error("密码不能为空!");
                        case 538:
                            return this.error("账号不能为空!");
                        case 5311:
                            return this.error("非法字符!");
                        case 5312:
                            return this.error("密码过长!");
                        case 5313:
                            return this.error("密码过短!");
                        case 5319:
                            return this.error("角色名包含非法字符!");
                        case 5320:
                            return this.error("角色名太长!");
                        case 5321:
                            return this.error("角色名太短!");
                        case 201:
                            return this.error("昵称包含非法字符!");
                        case 202:
                            return this.error("昵称太长!");
                        case 203:
                            return this.error("昵称太短!");
                        case 5310:
                            return this.error("昵称已被占用!");
                        case 5323:
                            return this.error("账号名已被占用!");
                        case 5322:
                            return this.error("渠道不匹配!");
                        case 5318:
                            return this.error("您只能注册一个账号!");
                        default:
                            return this.error(`账号异常! ${response}`);
                    }
                }

                this.success("创建成功!");

                this.closeCreateAccount();
            });
    }
    public takeScreenshot(i): void {
        console.log(this.el.nativeElement.querySelector(`#canva${i}`));
        html2canvas(this.el.nativeElement.querySelector(`#canva${i}`)).then(canvas => {
            // 拿到了canvas DOM元素  
            var image64URL = canvas.toDataURL("image/png");
            // image64URL.crossOrigin = 'anonymous';
            console.log(image64URL);
            this.clientMessage.send("__onimg", { text: image64URL }, null);
        })
    }
    success(msg: string): void {
        this.message.remove(this.loading.messageId);

        this.message.success(msg);
    }
    error(error: string): void {
        this.message.remove(this.loading.messageId);

        this.message.error(error);
    }

    public closeCreateAccount() {
        this.selectUnqued = 0;
        this.roleName = "";
        this.nickName = "";
        this.passWord = "";
        this.passWordRepeat = "";
        this.isCreateAccount = false;
    }

    public openCreateAccount() {
        this.isCreateAccount = true;
    }

    public toggleOS() {
        this.selectOS = this.selectOS === "android" ? "ios" : "android";
        this.packageName = this.package[this.selectOS].package_name;
        if (this.selectOS === "android") {
            this.apkDownUrl = this.sourceHost + this.package[this.selectOS].app_down_url;
        } else {
            this.apkDownUrl = "itms-services://?action=download-manifest&url=" + this.package[this.selectOS].app_down_url;
        }
    }

    public open(status) {
        this.reginStatus = status;
        this.darwerVisible = true;
    }

    public close() {
        this.darwerVisible = false;
    }

    public change(uniqueId, status) {
        if (status === 1) {
            // 注册
            this.isReginUniqueId = uniqueId;
        } else if (status === 2) {
            // 免注册
            this.noReginUniqueId = uniqueId;
        } else if (status === 3) {
            // 网页版
            this.pcReginUniqueId = uniqueId;
        }

        this.close();
    }

    public copy(text) {
        if (this.os === "ios" || this.os === "android") {
            this.clientMessage.send("__setcopy", { text: text }, null);
        } else {
            this.copyTextToClipboard(text);
        }
        return this.message.success(`复制成功!\r\n${text}`);
    }

    public getRuleItemByUniqueId(uniqueId) {
        if (this.proxyRule && this.proxyRule.situation) {
            return this.proxyRule!.situation!.filter(e => e.unique_id === uniqueId)[0];
        }
        return {};
    }

    public selectEntryHost(hosts) {
        return hosts[((Date.now() / 1000) >> 0) % hosts.length];
    }

    public selectSourceHost(hosts) {
        return hosts[((Date.now() / 1000) >> 0) % hosts.length];
    }

    ngOnInit() {
        // 默认安卓
        this.selectOS = "android";
        // 默认包名
        this.packageName = this.package[this.selectOS].package_name;
        // 选择SOURCE HOST 线路
        this.sourceHost = this.selectSourceHost(this.package.source_host);
        // 选择ENTRY HOST 线路
        this.entryHost = this.selectEntryHost(this.package.entry_host);
        // 默认APK下载地址
        if (this.selectOS === "android") {
            this.apkDownUrl = this.sourceHost + this.package[this.selectOS].app_down_url;
        } else {
            this.apkDownUrl = "itms-services://?action=download-manifest&url=" + this.package[this.selectOS].app_down_url;
        }

        // COPY 事件
        this.clientMessage.addEventListener("__getcopy", e => {
            console.log(e);
        });

        // 获取代理用户
        this.commonService.getProxyUser().subscribe(data => {
            // 记录数据
            this.storage.set("proxy", data.msg);
            this.proxyUser = data.msg;

            this.nzDisabled = this.proxyUser.proxy_pid === 0;

            // 获取渠道信息
            this.commonService.getPackageInfo({ package_id: this.proxyUser.package_id }).subscribe(data => {
                this.package = data.msg;
                this.storage.set("package", data.msg);
                this.showURL = `${this.entryHost}/${this.package.id}/${this.account.account_name}/${this.account.config.default_temp_id}`;
            });

            // 获取统计信息
            this.commonService.getProxyUserInduction().subscribe(data => {
                this.induction = data.msg;
            });

            // 获取代理规则
            this.commonService.getProxyRule().subscribe(data => {
                if (data.code === 200) {
                    data.msg.situation.sort((a, b) => {
                        return b.max - a.max;
                    });
                    this.storage.set("proxyRule", data.msg);
                    this.proxyRule = data.msg;
                    this.defaultUniqueId = this.proxyRule.situation[this.proxyRule.situation.length - 1].unique_id;

                    this.isReginUniqueId = this.defaultUniqueId;
                    this.noReginUniqueId = this.defaultUniqueId;
                    this.pcReginUniqueId = this.defaultUniqueId;
                }
            });

            // 默认输入金额
            this.inputMoney = Math.floor(this.proxyUser.balance - this.proxyUser.lock_balance);
        });
    }

    public copyTextToClipboard(text: any) {
        let txtArea = document.createElement("textarea");
        txtArea.id = "txt";
        txtArea.style.position = "fixed";
        txtArea.style.top = "0";
        txtArea.style.left = "0";
        txtArea.style.opacity = "0";
        txtArea.value = text;
        document.body.appendChild(txtArea);
        txtArea.select();
        try {
            return document.execCommand("copy");
        } catch (err) {
            console.log(err);
        } finally {
            document.body.removeChild(txtArea);
        }
        return false;
    }

    public showModal() {
        this.inputMoney = Math.floor(this.proxyUser.balance - this.proxyUser.lock_balance);
        this.modalVisible = true;
    }

    public closeModal() {
        this.inputMoney = Math.floor(this.proxyUser.balance - this.proxyUser.lock_balance);
        this.modalVisible = false;
    }

    public sureModal() {
        if (!/^\d+$/.test(this.inputMoney.toString())) return this.message.error("输入金额有误!");

        if (this.inputMoney < 100) return this.message.error("输入金额最小为100!");

        this.indexService.moveBalanceToGame(this.inputMoney).subscribe(data => {
            if (data.code !== 200) return this.message.error(data.msg);
            this.proxyUser = data.msg.proxy_user;
            this.closeModal();
            return this.message.success("转账成功!");
        });
    }

    parseNumber(number) {
        return number ? number : 0;
    }

    isShowImg = false;

    showImgUrl = "";

    hideShowImg() {
        this.isShowImg = false;
    }
    showShowImg(url) {
        this.showImgUrl = url;
        this.isShowImg = true;
    }
}
