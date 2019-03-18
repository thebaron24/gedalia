import { BrowserModule, BrowserTransferStateModule, Title, Meta } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './modules/app-routing.module';
import { MaterialModule } from './modules/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PageComponent } from './components/page/page.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { BlogComponent } from './components/blog/blog.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { PostFilterPipe } from './pipes/post-filter.pipe';
import { environment } from '../environments/environment';
import { ProgressOverlayComponent } from './components/progress-overlay/progress-overlay.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    SideMenuComponent,
    HomeComponent,
    PageNotFoundComponent,
    PageComponent,
    SafeHtmlPipe,
    BlogComponent,
    TestimonialsComponent,
    PostFilterPipe,
    ProgressOverlayComponent,
    FooterComponent
  ],
  entryComponents: [ProgressOverlayComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [Title, Meta],
  bootstrap: [AppComponent]
})
export class AppModule { }
