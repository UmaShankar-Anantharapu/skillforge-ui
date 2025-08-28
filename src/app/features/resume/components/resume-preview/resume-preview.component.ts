import { Component, Input, OnInit } from '@angular/core';
import { Resume, Experience, Education, Project, Certification } from '../../models/resume.model';

@Component({
  selector: 'app-resume-preview',
  template: `
    <div class="resume-preview-container">
      <div class="preview-header">
        <h3>Resume Preview</h3>
        <button 
          type="button" 
          class="toggle-btn"
          (click)="toggleFullPreview()">
          {{isFullPreview ? 'Compact View' : 'Full Preview'}}
        </button>
      </div>

      <div class="resume-content" [class.full-preview]="isFullPreview">
        <!-- Personal Information -->
        <div class="section personal-info" *ngIf="resume?.personalInfo">
          <div class="name-header">
            <h1>{{resume.personalInfo.fullName || resume.personalInfo.name || 'Your Name'}}</h1>
          </div>
          <div class="contact-info">
            <div class="contact-item" *ngIf="resume.personalInfo.email">
              <i class="icon-email"></i>
              <span>{{resume.personalInfo.email}}</span>
            </div>
            <div class="contact-item" *ngIf="resume.personalInfo.phone">
              <i class="icon-phone"></i>
              <span>{{resume.personalInfo.phone}}</span>
            </div>
            <div class="contact-item" *ngIf="resume.personalInfo.location">
              <i class="icon-location"></i>
              <span>{{resume.personalInfo.location}}</span>
            </div>
            <div class="contact-item" *ngIf="resume.personalInfo.linkedIn">
              <i class="icon-linkedin"></i>
              <a [href]="getLinkedInUrl(resume.personalInfo.linkedIn)" target="_blank">
                {{resume.personalInfo.linkedIn}}
              </a>
            </div>
            <div class="contact-item" *ngIf="resume.personalInfo.github">
              <i class="icon-github"></i>
              <a [href]="getGitHubUrl(resume.personalInfo.github)" target="_blank">
                {{resume.personalInfo.github}}
              </a>
            </div>
            <div class="contact-item" *ngIf="resume.personalInfo.portfolio">
              <i class="icon-portfolio"></i>
              <a [href]="getPortfolioUrl(resume.personalInfo.portfolio)" target="_blank">
                {{resume.personalInfo.portfolio}}
              </a>
            </div>
          </div>
        </div>

        <!-- Professional Summary -->
        <div class="section" *ngIf="resume?.professionalSummary?.content">
          <h2>Professional Summary</h2>
          <p class="summary-content">{{resume.professionalSummary.content}}</p>
        </div>

        <!-- Experience -->
        <div class="section" *ngIf="resume?.experience?.length">
          <h2>Professional Experience</h2>
          <div class="experience-list">
            <div class="experience-item" *ngFor="let exp of resume.experience">
              <div class="experience-header">
                <div class="position-company">
                  <h3>{{exp.position}}</h3>
                  <h4>{{exp.company}}</h4>
                </div>
                <div class="dates">
                  {{formatDate(exp.startDate)}} - {{exp.current ? 'Present' : formatDate(exp.endDate)}}
                </div>
              </div>
              <p class="description" *ngIf="exp.description">{{exp.description}}</p>
              <div class="technologies" *ngIf="exp.technologies?.length">
                <strong>Technologies:</strong>
                <span class="tech-list">{{exp.technologies.join(', ')}}</span>
              </div>
              <ul class="achievements" *ngIf="exp.achievements?.length">
                <li *ngFor="let achievement of exp.achievements">{{achievement}}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Education -->
        <div class="section" *ngIf="resume?.education?.length">
          <h2>Education</h2>
          <div class="education-list">
            <div class="education-item" *ngFor="let edu of resume.education">
              <div class="education-header">
                <div class="degree-institution">
                  <h3>{{edu.degree}} in {{edu.field}}</h3>
                  <h4>{{edu.institution}}</h4>
                </div>
                <div class="dates">
                  {{formatDate(edu.startDate)}} - {{formatDate(edu.endDate)}}
                </div>
              </div>
              <div class="gpa" *ngIf="edu.gpa">
                <strong>GPA:</strong> {{edu.gpa}}
              </div>
              <div class="coursework" *ngIf="edu.relevant_coursework?.length">
                <strong>Relevant Coursework:</strong>
                <span>{{edu.relevant_coursework.join(', ')}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="section" *ngIf="hasSkills()">
          <h2>Skills</h2>
          <div class="skills-grid">
            <div class="skill-category" *ngIf="resume.skills?.technical?.length">
              <h4>Technical Skills</h4>
              <div class="skill-tags">
                <span class="skill-tag" *ngFor="let skill of resume.skills.technical">{{skill}}</span>
              </div>
            </div>
            <div class="skill-category" *ngIf="resume.skills?.frameworks?.length">
              <h4>Frameworks & Libraries</h4>
              <div class="skill-tags">
                <span class="skill-tag" *ngFor="let skill of resume.skills.frameworks">{{skill}}</span>
              </div>
            </div>
            <div class="skill-category" *ngIf="resume.skills?.databases?.length">
              <h4>Databases</h4>
              <div class="skill-tags">
                <span class="skill-tag" *ngFor="let skill of resume.skills.databases">{{skill}}</span>
              </div>
            </div>
            <div class="skill-category" *ngIf="resume.skills?.tools?.length">
              <h4>Tools & Technologies</h4>
              <div class="skill-tags">
                <span class="skill-tag" *ngFor="let skill of resume.skills.tools">{{skill}}</span>
              </div>
            </div>
            <div class="skill-category" *ngIf="resume.skills?.soft_skills?.length">
              <h4>Soft Skills</h4>
              <div class="skill-tags">
                <span class="skill-tag" *ngFor="let skill of resume.skills.soft_skills">{{skill}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects -->
        <div class="section" *ngIf="resume?.projects?.length">
          <h2>Projects</h2>
          <div class="projects-list">
            <div class="project-item" *ngFor="let project of resume.projects">
              <div class="project-header">
                <h3>{{project.name}}</h3>
                <div class="project-links">
                  <a *ngIf="project.github_url" [href]="project.github_url" target="_blank" class="project-link">
                    <i class="icon-github"></i> GitHub
                  </a>
                  <a *ngIf="project.live_url" [href]="project.live_url" target="_blank" class="project-link">
                    <i class="icon-external"></i> Live Demo
                  </a>
                </div>
              </div>
              <p class="project-description" *ngIf="project.description">{{project.description}}</p>
              <div class="project-technologies" *ngIf="project.technologies?.length">
                <strong>Technologies:</strong>
                <span class="tech-list">{{project.technologies.join(', ')}}</span>
              </div>
              <ul class="project-highlights" *ngIf="project.highlights?.length">
                <li *ngFor="let highlight of project.highlights">{{highlight}}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div class="section" *ngIf="resume?.certifications?.length">
          <h2>Certifications</h2>
          <div class="certifications-list">
            <div class="certification-item" *ngFor="let cert of resume.certifications">
              <div class="certification-header">
                <h3>{{cert.name}}</h3>
                <div class="cert-date">{{formatDate(cert.date)}}</div>
              </div>
              <div class="cert-issuer">{{cert.issuer}}</div>
              <div class="cert-details">
                <span *ngIf="cert.credential_id" class="credential-id">
                  Credential ID: {{cert.credential_id}}
                </span>
                <a *ngIf="cert.url" [href]="cert.url" target="_blank" class="cert-link">
                  View Certificate
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!hasContent()">
          <div class="empty-icon">📄</div>
          <h3>No Content Yet</h3>
          <p>Start building your resume by filling out the sections in the wizard.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resume-preview-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .preview-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .toggle-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .toggle-btn:hover {
      background: #0056b3;
    }

    .resume-content {
      padding: 20px;
      max-height: 600px;
      overflow-y: auto;
    }

    .resume-content.full-preview {
      max-height: none;
    }

    .section {
      margin-bottom: 30px;
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section h2 {
      color: #333;
      font-size: 1.25rem;
      margin: 0 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #007bff;
    }

    /* Personal Information */
    .personal-info {
      text-align: center;
      margin-bottom: 40px;
    }

    .name-header h1 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 2rem;
      font-weight: 600;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #666;
    }

    .contact-item a {
      color: #007bff;
      text-decoration: none;
    }

    .contact-item a:hover {
      text-decoration: underline;
    }

    /* Professional Summary */
    .summary-content {
      line-height: 1.6;
      color: #333;
      margin: 0;
    }

    /* Experience */
    .experience-item {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .experience-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .position-company h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .position-company h4 {
      margin: 0;
      color: #666;
      font-size: 1rem;
      font-weight: 500;
    }

    .dates {
      color: #666;
      font-size: 14px;
      white-space: nowrap;
    }

    .description {
      margin: 10px 0;
      line-height: 1.5;
      color: #333;
    }

    .technologies {
      margin: 10px 0;
      font-size: 14px;
    }

    .tech-list {
      color: #666;
      margin-left: 5px;
    }

    .achievements {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }

    .achievements li {
      margin-bottom: 5px;
      line-height: 1.4;
      color: #333;
    }

    /* Education */
    .education-item {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    .education-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .degree-institution h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .degree-institution h4 {
      margin: 0;
      color: #666;
      font-size: 1rem;
      font-weight: 500;
    }

    .gpa, .coursework {
      margin: 5px 0;
      font-size: 14px;
      color: #333;
    }

    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .skill-category h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1rem;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Projects */
    .project-item {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .project-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .project-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .project-links {
      display: flex;
      gap: 10px;
    }

    .project-link {
      color: #007bff;
      text-decoration: none;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .project-link:hover {
      text-decoration: underline;
    }

    .project-description {
      margin: 10px 0;
      line-height: 1.5;
      color: #333;
    }

    .project-technologies {
      margin: 10px 0;
      font-size: 14px;
    }

    .project-highlights {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }

    .project-highlights li {
      margin-bottom: 5px;
      line-height: 1.4;
      color: #333;
    }

    /* Certifications */
    .certification-item {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    .certification-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .certification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 5px;
    }

    .certification-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .cert-date {
      color: #666;
      font-size: 14px;
    }

    .cert-issuer {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .cert-details {
      display: flex;
      gap: 15px;
      font-size: 14px;
    }

    .credential-id {
      color: #666;
    }

    .cert-link {
      color: #007bff;
      text-decoration: none;
    }

    .cert-link:hover {
      text-decoration: underline;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* Icons (using text symbols for simplicity) */
    .icon-email::before { content: '✉️ '; }
    .icon-phone::before { content: '📞 '; }
    .icon-location::before { content: '📍 '; }
    .icon-linkedin::before { content: '💼 '; }
    .icon-github::before { content: '🔗 '; }
    .icon-portfolio::before { content: '🌐 '; }
    .icon-external::before { content: '🔗 '; }

    /* Responsive */
    @media (max-width: 768px) {
      .contact-info {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .experience-header,
      .education-header,
      .project-header,
      .certification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .dates {
        white-space: normal;
      }

      .skills-grid {
        grid-template-columns: 1fr;
      }

      .project-links {
        margin-top: 10px;
      }
    }
  `]
})
export class ResumePreviewComponent implements OnInit {
  @Input() resume: Resume | null = null;
  
  isFullPreview = false;

  ngOnInit() {
    // Component initialization
  }

  toggleFullPreview() {
    this.isFullPreview = !this.isFullPreview;
  }

  hasContent(): boolean {
    if (!this.resume) return false;
    
    return !!
      (this.resume.personalInfo?.fullName || this.resume.personalInfo?.name ||
       this.resume.professionalSummary?.content ||
       this.resume.experience?.length ||
       this.resume.education?.length ||
       this.hasSkills() ||
       this.resume.projects?.length ||
       this.resume.certifications?.length);
  }

  hasSkills(): boolean {
    if (!this.resume?.skills) return false;
    
    return !!
      (this.resume.skills.technical?.length ||
       this.resume.skills.frameworks?.length ||
       this.resume.skills.databases?.length ||
       this.resume.skills.tools?.length ||
       this.resume.skills.soft_skills?.length);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  getLinkedInUrl(linkedin: string): string {
    if (linkedin.startsWith('http')) {
      return linkedin;
    }
    return `https://linkedin.com/in/${linkedin}`;
  }

  getGitHubUrl(github: string): string {
    if (github.startsWith('http')) {
      return github;
    }
    return `https://github.com/${github}`;
  }

  getPortfolioUrl(portfolio: string): string {
    if (portfolio.startsWith('http')) {
      return portfolio;
    }
    return `https://${portfolio}`;
  }
}