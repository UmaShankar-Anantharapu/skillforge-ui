import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResearchAgentRoutingModule } from './research-agent-routing.module';
import { RoadmapGenerationComponent } from './pages/roadmap-generation/roadmap-generation.component';
import { WebSearchComponent } from './pages/web-search/web-search.component';
import { ContentScrapingComponent } from './pages/content-scraping/content-scraping.component';
import { TopicAnalysisComponent } from './pages/topic-analysis/topic-analysis.component';
import { ResourceComparisonComponent } from './pages/resource-comparison/resource-comparison.component';
import { ResearchAgentService } from '@app/core/services/research-agent.service';


@NgModule({
  declarations: [
    RoadmapGenerationComponent,
    WebSearchComponent,
    ContentScrapingComponent,
    TopicAnalysisComponent,
    ResourceComparisonComponent
  ],
  imports: [
    CommonModule,
    ResearchAgentRoutingModule
  ],
  providers: [
    ResearchAgentService
  ]
})
export class ResearchAgentModule { }
