import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { LoginService } from "./login.service";
import { Animations } from "../../animations";

import { NzMessageService } from "ng-zorro-antd";

import { StorageService } from "../../storage/storage.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.less"],
  providers: [],
  animations: [Animations]
})
export class LoginComponent implements OnInit {
  public rememberPassword: Boolean = true;
  public username: string = "";
  public password: string = "";
  public captcha: string = "";

  public state: string;

  public showCaptcha: string;

  public loginout = "";

  constructor(
    private loginServer: LoginService,
    private router: Router,
    private message: NzMessageService,
    private storage: StorageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.loginout = this.activatedRoute.snapshot.queryParams.loginout;
    if (this.storage.get("account")) this.router.navigate(["home"]);
  }

  public async ngOnInit() {
    this.parseParams();
    await this.getCaptcha();
    this.autoLogin();
  }

  public parseParams() {
    if (this.loginout) return false;

    let params = window.location.search.substring(1);

    if (!params) return false;

    let paramsArray = params.split("&");

    if (paramsArray.length < 0) return false;

    let paramsMap = {};

    paramsArray.forEach(e => {
      let key = e.split("=");
      if (key.length !== 2) return false;
      paramsMap[key[0]] = key[1];
    });

    if (!paramsMap["host"]) return false;

    this.storage.set("host", paramsMap["host"]);

    this.storage.set("os", paramsMap["os"]);

    if (!paramsMap["account_name"]) return false;

    if (!paramsMap["account_pass"]) return false;

    this.username = paramsMap["account_name"];

    this.password = paramsMap["account_pass"];
  }

  public autoLogin() {
    return this.loginService();
  }

  public async getCaptcha() {
    let data = await this.loginServer.getCaptcha().toPromise();
    this.showCaptcha = data.msg;
  }

  public login() {
    if (!this.username) return this.message.error("用户名不能为空!");
    if (!this.password) return this.message.error("密码不能为空!");
    if (!this.captcha) return this.message.error("验证码不能为空!");

    this.loginService();
  }

  public loginService() {
    if (!this.username) return false;
    if (!this.password) return false;
    if (!this.showCaptcha) return false;

    this.loginServer
      .login({
        account_name: this.username,
        account_pass: this.password,
        captcha: this.showCaptcha
      })
      .subscribe(
        (data): any => {
          if (!data || data.code !== 200) return this.message.error(data.msg);
          this.storage.set("token", data.msg.token);
          this.storage.set("package", data.msg.package);
          this.storage.set("account", data.msg.account, () => {
            let id = this.message.loading("正在登录...", { nzDuration: 0 }).messageId;
            setTimeout(() => {
              this.message.remove(id);
              this.router.navigate(["home"]);
            }, 300);
          });
        }
      );
  }
}
