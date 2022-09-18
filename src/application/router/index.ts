import { OnRouteChange, UrlParts } from './router.interface';

const HASH = '#/';

export class Router {
    routes: Record<string, { name: string; onRouteChange: OnRouteChange }>;

    settings: Record<string, string>;

    urlParts: UrlParts;

    subscribers: OnRouteChange[];

    initialHref: string;

    constructor() {
      this.routes = {};
      this.urlParts = this.getUrlParts();
      this.subscribers = [];
      this.settings = {};
      [this.initialHref] = window.location.href.split('#');
      window.addEventListener('hashchange', this._onRouteChange.bind(this));
    }

    init({ home, error }: { home: string; error: string }) {
      this.urlParts = this.getUrlParts();
      this.settings = { home, error };
      const route = this.getRoute(this.urlParts.url);

      if (this.routes[route]) {
        return this.routes[route].onRouteChange(this);
      }

      return this.push(home);
    }

    _onRouteChange(e: HashChangeEvent) {
      this.urlParts = this.getUrlParts();
      const route = this.getRoute(this.urlParts.url);

      if (!this.routes[route]) {
        this.push(this.settings.error);
        throw Error(`unregistered route: ${this.urlParts.url}`);
      }

      if (this.routes[route]) this.routes[route].onRouteChange(this, e);
      this.notify(e);
    }

    push(url: string) {
      const hashUrl = `${HASH}${url}`;
      window.location.href = this.initialHref + hashUrl;
    }

    subscribe(fn: OnRouteChange) {
      this.subscribers.push(fn);
    }

    register(url: string, name: string, onRouteChange: OnRouteChange) {
      const hashUrl = `${HASH}${url}`;
      this.routes[hashUrl] = { name, onRouteChange };
      return this;
    }

    getUrlParts() {
      const [url, query] = window.location.hash.split('?');
      return { url, query };
    }

    notify(e: HashChangeEvent) {
      this.subscribers.forEach((fn) => fn(this, e));
    }

    // find registered route by url
    getRoute(path: string) {
      const routes = Object.keys(this.routes);
      const [route] = routes.filter(
        (el) => !el.split('/').reduce((result, routePart) => {
          const [pathPart, ...rest] = result;
          const tempRoutes = { [pathPart]: rest, ':id': rest };
          return tempRoutes[routePart] || result;
        }, path.split('/')).length,
      );
      return route;
    }
}
