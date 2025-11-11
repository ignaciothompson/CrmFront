import { Injectable, signal, effect, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Bootstrap 5 breakpoints:
 * xs: < 576px
 * sm: >= 576px
 * md: >= 768px
 * lg: >= 992px
 * xl: >= 1200px
 * xxl: >= 1400px
 */
@Injectable({
  providedIn: 'root'
})
export class BreakpointService implements OnDestroy {
  // Signals for each breakpoint
  public readonly isXs = signal<boolean>(false);
  public readonly isSm = signal<boolean>(false);
  public readonly isMd = signal<boolean>(false);
  public readonly isLg = signal<boolean>(false);
  public readonly isXl = signal<boolean>(false);
  public readonly isXxl = signal<boolean>(false);

  // Computed signals for convenience
  public readonly isMobile = signal<boolean>(false); // xs or sm
  public readonly isTablet = signal<boolean>(false); // md
  public readonly isDesktop = signal<boolean>(false); // lg and above

  private resizeSubscription?: Subscription;

  constructor() {
    // Initialize breakpoints
    this.updateBreakpoints();

    // Listen to window resize events with debounce
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => this.updateBreakpoints());

    // Update computed signals when breakpoints change
    effect(() => {
      this.isMobile.set(this.isXs() || this.isSm());
    });

    effect(() => {
      this.isTablet.set(this.isMd());
    });

    effect(() => {
      this.isDesktop.set(this.isLg() || this.isXl() || this.isXxl());
    });

    // Add CSS classes to body element for CSS usage
    effect(() => {
      if (typeof document !== 'undefined') {
        const body = document.body;
        body.classList.toggle('breakpoint-xs', this.isXs());
        body.classList.toggle('breakpoint-sm', this.isSm());
        body.classList.toggle('breakpoint-md', this.isMd());
        body.classList.toggle('breakpoint-lg', this.isLg());
        body.classList.toggle('breakpoint-xl', this.isXl());
        body.classList.toggle('breakpoint-xxl', this.isXxl());
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  private updateBreakpoints(): void {
    const width = window.innerWidth;

    // Bootstrap 5 breakpoints
    this.isXs.set(width < 576);
    this.isSm.set(width >= 576 && width < 768);
    this.isMd.set(width >= 768 && width < 992);
    this.isLg.set(width >= 992 && width < 1200);
    this.isXl.set(width >= 1200 && width < 1400);
    this.isXxl.set(width >= 1400);
  }

  /**
   * Get current breakpoint name
   */
  getCurrentBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' {
    if (this.isXxl()) return 'xxl';
    if (this.isXl()) return 'xl';
    if (this.isLg()) return 'lg';
    if (this.isMd()) return 'md';
    if (this.isSm()) return 'sm';
    return 'xs';
  }
}

