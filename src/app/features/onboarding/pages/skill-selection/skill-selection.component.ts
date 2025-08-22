import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-skill-selection',
  templateUrl: './skill-selection.component.html',
  styleUrl: './skill-selection.component.scss'
})
export class SkillSelectionComponent implements OnInit {
  @ViewChild('skillInput') skillInput!: ElementRef<HTMLInputElement>;
  @Output() skillsSelected = new EventEmitter<string[]>();

  skillCtrl = new FormControl('');
  filteredSkills: Observable<string[]> = new Observable<string[]>();
  selectedSkills: string[] = [];

  // Sample list of common tech skills
  allSkills: string[] = [
    'JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue.js',
    'Node.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub',
    'CI/CD', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Swift', 'Kotlin', 'Flutter',
    'React Native', 'GraphQL', 'REST API', 'Redux', 'SASS/SCSS', 'Tailwind CSS',
    'Bootstrap', 'Material UI', 'Figma', 'Adobe XD', 'Sketch', 'Agile', 'Scrum',
    'Jira', 'TDD', 'Unit Testing', 'Jest', 'Mocha', 'Cypress', 'Selenium',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'NLP',
    'Computer Vision', 'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts',
    'WebRTC', 'Socket.io', 'Redis', 'ElasticSearch', 'Kafka', 'RabbitMQ',
    'Microservices', 'Serverless', 'Linux', 'Bash', 'PowerShell', 'Rust',
    'Go', 'Scala', 'Clojure', 'Haskell', 'WebAssembly', 'PWA', 'SEO',
    'Accessibility', 'Performance Optimization', 'Security', 'DevOps',
    'SRE', 'Data Analysis', 'Data Visualization', 'D3.js', 'Tableau',
    'Power BI', 'Excel', 'VBA', 'Hadoop', 'Spark', 'Big Data'
  ];

  ngOnInit() {
    this.filteredSkills = this.skillCtrl.valueChanges.pipe(
      startWith(null),
      map((skill: string | null) => {
        if (!skill) return this.allSkills.slice();
        return this._filter(skill);
      })
    );
  }

  add(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (value && !this.selectedSkills.includes(value)) {
      this.selectedSkills.push(value);
      this.skillsSelected.emit(this.selectedSkills);
    }
    this.skillInput.nativeElement.value = '';
    this.skillCtrl.setValue(null);
  }

  addCustomSkill(input: HTMLInputElement): void {
    const value = (input.value || '').trim();
    if (value && !this.selectedSkills.includes(value)) {
      this.selectedSkills.push(value);
      this.skillsSelected.emit(this.selectedSkills);
    }
    input.value = '';
    this.skillCtrl.setValue(null);
  }

  remove(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index >= 0) {
      this.selectedSkills.splice(index, 1);
      this.skillsSelected.emit(this.selectedSkills);
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allSkills.filter(skill => 
      skill.toLowerCase().includes(filterValue) && 
      !this.selectedSkills.includes(skill)
    );
  }
}
