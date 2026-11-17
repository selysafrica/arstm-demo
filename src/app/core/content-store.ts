import { Injectable, computed, signal } from '@angular/core';
import { Article, EVENTS, EventItem, JOBS, NEWS } from '../data/site';

export type PublishState = 'Brouillon' | 'En relecture' | 'Programmé' | 'Publié' | 'Archivé';

export interface ManagedArticle extends Article {
  id: number;
  state: PublishState;
  author: string;
  updated: string;
  scheduledAt?: string;
  en: boolean;
}

export interface AlertSettings {
  enabled: boolean;
  text: string;
  link: string;
  fragment?: string;
}

/**
 * Contenus partagés entre le back-office et le site public.
 * Ce qui est publié dans /admin apparaît immédiatement sur le site (démo en mémoire).
 */
@Injectable({ providedIn: 'root' })
export class ContentStore {
  private nextId = 100;

  readonly articles = signal<ManagedArticle[]>(
    NEWS.map((n, i) => ({
      ...n,
      id: i + 1,
      state: 'Publié' as PublishState,
      author: i % 2 ? 'Vadabla DEA' : 'Chantal KOFFI',
      updated: n.date,
      en: i < 3,
    })),
  );

  /** Ce que voit le public : uniquement les articles publiés */
  readonly publishedNews = computed(() => this.articles().filter((a) => a.state === 'Publié'));

  readonly events = signal<(EventItem & { id: number })[]>(EVENTS.map((e, i) => ({ ...e, id: i + 1 })));
  readonly jobs = signal(JOBS.map((j, i) => ({ ...j, id: i + 1, published: true })));

  readonly alert = signal<AlertSettings>({
    enabled: true,
    text: 'Concours d’entrée 2027 : inscriptions du 15 janvier au 15 mars',
    link: '/admissions',
    fragment: 'concours',
  });

  upsertArticle(a: Partial<ManagedArticle> & { title: string }): ManagedArticle {
    const list = this.articles();
    if (a.id) {
      const merged = { ...list.find((x) => x.id === a.id)!, ...a } as ManagedArticle;
      this.articles.set(list.map((x) => (x.id === a.id ? merged : x)));
      return merged;
    }
    const id = this.nextId++;
    const created: ManagedArticle = {
      category: 'Vie de l’Académie',
      tone: 'blue',
      date: today(),
      img: 'img/campus-arcades.jpg',
      alt: a.title,
      excerpt: '',
      body: [],
      state: 'Brouillon',
      author: 'Vous',
      updated: today(),
      en: false,
      ...a,
      slug: a.slug || slugify(a.title) + '-' + id,
      id,
    } as ManagedArticle;
    this.articles.set([created, ...list]);
    return created;
  }

  removeArticle(id: number) {
    this.articles.update((l) => l.filter((x) => x.id !== id));
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function today() {
  return new Date(2026, 10, 17).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
