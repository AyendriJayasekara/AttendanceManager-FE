import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'personal-info',
        component: PersonalInfoComponent
      },
      
    ]
  }
];
