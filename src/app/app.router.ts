import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component'
import { IndexComponent } from "./pages/home/index/index.component";
import { HomeComponent } from './pages//home/home/home.component'
import { MoneyComponent } from "./pages/home/money/money.component";
import { ProxyComponent } from "./pages/home/proxy/proxy/proxy.component";
import { PlayerComponent } from "./pages/home/player/player.component";
import { IncomeComponent } from './pages/home/proxy/income/income.component';

// 路由配置
export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'login', component: LoginComponent },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            { path: 'index', pathMatch: 'full', component: IndexComponent },
            { path: 'money', pathMatch: 'full', component: MoneyComponent },
            {
                path: 'proxy', children: [
                    { path: 'index', pathMatch: 'full', component: ProxyComponent },
                    { path: 'income', pathMatch: 'full', component: IncomeComponent },
                    { path: '**', redirectTo: 'index' }
                ]
            },
            { path: 'player', pathMatch: 'full', component: PlayerComponent },
            { path: '**', redirectTo: 'index' }
        ]
    },
    { path: '**', component: LoginComponent },
]

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }