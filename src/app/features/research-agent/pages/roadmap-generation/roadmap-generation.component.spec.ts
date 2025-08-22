import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadmapGenerationComponent } from './roadmap-generation.component';

describe('RoadmapGenerationComponent', () => {
  let component: RoadmapGenerationComponent;
  let fixture: ComponentFixture<RoadmapGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoadmapGenerationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadmapGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
