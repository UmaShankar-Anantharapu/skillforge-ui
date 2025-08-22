import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceComparisonComponent } from './resource-comparison.component';

describe('ResourceComparisonComponent', () => {
  let component: ResourceComparisonComponent;
  let fixture: ComponentFixture<ResourceComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceComparisonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResourceComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
