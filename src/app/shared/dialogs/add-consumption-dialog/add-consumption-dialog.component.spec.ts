import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsumptionDialogComponent } from './add-consumption-dialog.component';

describe('AddConsumptionDialogComponent', () => {
  let component: AddConsumptionDialogComponent;
  let fixture: ComponentFixture<AddConsumptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConsumptionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConsumptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
