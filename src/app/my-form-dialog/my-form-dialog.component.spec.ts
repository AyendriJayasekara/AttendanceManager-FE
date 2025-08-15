import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFormDialogComponent } from './my-form-dialog.component';

describe('MyFormDialogComponent', () => {
  let component: MyFormDialogComponent;
  let fixture: ComponentFixture<MyFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
