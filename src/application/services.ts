import { GarageService } from '../services/garageService';
import { DependencyResolver } from './helpers/dependencyResolver';
import { Router } from './router';
import { Store } from '../store';
import { RaceService } from '../services/raceService';

export enum SERVICES {
    ROUTER = 'router',
    DEPENDENCY_RESOLVER = 'dependencyResolver',
    GARAGE_SERVICE = 'garageService',
    STORE = 'store',
    RACE_SERVICE = 'raceService'
}

interface Service<A = unknown, T = unknown> {
    new (...args: A[]): T;
}

export type AppServices = {
    [name: string]: unknown;
    [SERVICES.ROUTER]: Router;
    [SERVICES.DEPENDENCY_RESOLVER]: DependencyResolver;
    [SERVICES.GARAGE_SERVICE]: GarageService;
    [SERVICES.STORE]: Store;
    [SERVICES.RACE_SERVICE]: RaceService;
};

class Services {
    services: AppServices;

    static get instance() {
      return new Services();
    }

    constructor() {
      this.services = {} as AppServices;
    }

    registerService = <T = unknown>(name: string, Service: Service<T>, ...args: T[]) => {
      this.services[name] = new Service(...args);
      return this;
    };
}

export default Services.instance;
