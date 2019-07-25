// 核心组件
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// 网络组件
import { HttpClientModule } from "@angular/common/http";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./http/auth.interceptor";

import { registerLocaleData } from "@angular/common";
import zh from "@angular/common/locales/zh";
registerLocaleData(zh);

// UI组件
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG, NZ_I18N, zh_CN } from "ng-zorro-antd";


import { NgxQRCodeModule } from "ngx-qrcode2";

// 路由组件
import { AppRoutingModule } from "./app.router";

// 模块组件
import { AppComponent } from "./app.component";
import { LoginComponent } from "./pages/login/login.component";
import { HomeComponent } from "./pages/home/home/home.component";
import { IndexComponent } from "./pages/home/index/index.component";
import { MoneyComponent } from "./pages/home/money/money.component";
import { ProxyComponent } from "./pages/home/proxy/proxy/proxy.component";
import { PlayerComponent } from "./pages/home/player/player.component";
import { IncomeComponent } from "./pages/home/proxy/income/income.component";

@NgModule({
    declarations: [AppComponent, LoginComponent, HomeComponent, IndexComponent, MoneyComponent, ProxyComponent, PlayerComponent, IncomeComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxQRCodeModule,

        // 全局消息模块
        NgZorroAntdModule
        // NZ UI 模块
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: NZ_MESSAGE_CONFIG,
            useValue: {
                nzDuration: 3000,
                nzMaxStack: 3,
                nzPauseOnHover: false,
                nzAnimate: true
            }
        },
        { provide: NZ_I18N, useValue: zh_CN }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
