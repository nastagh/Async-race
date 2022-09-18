import { AppServices } from '../services';

interface EntityModel<T> {
    new (...args: unknown[]): T;
}

interface Entity<T> {
    name: string;
    model: EntityModel<T>;
    services: string[];
}

export class DependencyResolver {
    services: AppServices;

    factory: { [key: string]: Omit<Entity<unknown>, 'name'> };

    constructor(services: AppServices) {
      this.services = services;
      this.factory = {};
    }

    register({ name, model, services }: {
      name: string;
      model: unknown;
      services: string[]
    }): void {
      this.factory[name] = { model, services } as Omit<Entity<unknown>, 'name'>;
    }

    get<M = unknown, T = unknown>(name: string, ...args: T[]): M {
      const { model: Model, services } = this.factory[name];
      return new Model(
        ...services.map((servicesName): unknown => this.services[servicesName]),
        ...args,
      ) as M;
    }
}
