import { trigger, transition, style, animate } from '@angular/animations';

export const stepTransition = trigger('stepTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(10px)' }), // Reduced movement for smoother transition
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })) // Faster animation
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(-10px)' })) // Faster exit
  ])
]);

export const overlayFadeScale = trigger('overlayFadeScale', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('150ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 }))
  ])
]);