import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Theme } from '../models/theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<Theme | null>(null);

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  async load(): Promise<void> {
    const theme = await firstValueFrom(this.http.get<Theme>('/assets/theme.json'));
    this.theme$.next(theme);
    this.applyTheme(theme);

    if (theme.i18n) {
      this.translate.addLangs(theme.i18n.available);
      this.translate.setDefaultLang(theme.i18n.defaultLang);
      this.translate.use(theme.i18n.defaultLang);
    }
  }

  getTheme(): Observable<Theme | null> {
    return this.theme$.asObservable();
  }

  get snapshot(): Theme | null {
    return this.theme$.value;
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement.style;
    root.setProperty('--primary-color', theme.branding.primaryColor);
    root.setProperty('--primary-contrast-color', theme.branding.primaryContrastColor);
    root.setProperty('--secondary-color', theme.branding.secondaryColor);
    root.setProperty('--secondary-contrast-color', theme.branding.secondaryContrastColor);

    if (theme.branding.name) {
      document.title = theme.branding.name;
    }

    if (theme.branding.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = theme.branding.faviconUrl;
    }
  }
}
