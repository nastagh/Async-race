import { PageGarage } from '../pages/garage';
import { GarageService } from '../services/garageService';
import { DependencyResolver } from './helpers/dependencyResolver';
import { PAGES, pages } from './pages';
import { Router } from './router';
import appServices, { SERVICES } from './services';
import { Store } from '../store';
import { RaceService } from '../services/raceService';

export * from './router';
export * from './pages';
export * from './routes';

const { services, registerService } = appServices;

class App {
  start() {
    this.registerAppServices();
    this.registerPages();
  }

  registerAppServices() {
    registerService(SERVICES.ROUTER, Router)
      .registerService(SERVICES.DEPENDENCY_RESOLVER, DependencyResolver, services)
      .registerService(SERVICES.GARAGE_SERVICE, GarageService)
      .registerService(SERVICES.STORE, Store)
      .registerService(SERVICES.RACE_SERVICE, RaceService);
  }

  registerPages() {
    pages.forEach((page) => {
      services.dependencyResolver.register(page);
      this.registerAppRoute(page.route, page.name);
    });
    services.router.init({
      home: PAGES.GARAGE,
      error: PAGES.ERROR,
    });
  }

  registerAppRoute(route: string, name: string) {
    services.router.register(route, name, () => {
      services.dependencyResolver.get<PageGarage>(name);
    });
  }
}

export default App;
