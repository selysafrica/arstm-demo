import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Outils d’accessibilité pour les personnes malvoyantes (EF-ERG-04). */
@Injectable({ providedIn: 'root' })
export class A11y {
  private readonly doc = inject(DOCUMENT);
  readonly largeText = signal(this.read('arstm-lg'));
  readonly contrast = signal(this.read('arstm-contrast'));

  constructor() {
    effect(() => this.apply('text-lg-mode', 'arstm-lg', this.largeText()));
    effect(() => this.apply('contrast-mode', 'arstm-contrast', this.contrast()));
  }

  private apply(cls: string, key: string, on: boolean) {
    this.doc.documentElement.classList.toggle(cls, on);
    try {
      localStorage.setItem(key, on ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  private read(key: string): boolean {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  }
}
