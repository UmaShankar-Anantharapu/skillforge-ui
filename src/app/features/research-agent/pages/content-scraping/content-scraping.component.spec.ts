import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentScrapingComponent } from './content-scraping.component';

describe('ContentScrapingComponent', () => {
  let component: ContentScrapingComponent;
  let fixture: ComponentFixture<ContentScrapingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentScrapingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentScrapingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
