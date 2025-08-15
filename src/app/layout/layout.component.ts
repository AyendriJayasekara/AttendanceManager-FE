import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyFormDialogComponent } from '../my-form-dialog/my-form-dialog.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(private router: Router, private dialog: MatDialog) {}


  navigateToPersonalInfo(): void {
    this.router.navigate(['/personal-info']);
  }

  navigateToHome(): void {
    this.router.navigate(['']);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MyFormDialogComponent, {
      height: 'auto',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
