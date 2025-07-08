import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { GamesComponent } from './games/games.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'content', component: ContentComponent },
  { path: 'games', component: GamesComponent },
  { path: 'about', component: AboutComponent },
];
