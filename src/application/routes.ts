export enum ROUTES {
    GARAGE = 'garage',
    RACE = 'race',
    RESULTS = 'results',
    ERROR = 'error',
    // CAR = 'garage/:id',
}

export type Routes = ROUTES.GARAGE | ROUTES.RACE | ROUTES.RESULTS;

export const routes = {
  garage: ROUTES.GARAGE,
  race: ROUTES.RACE,
  results: ROUTES.RESULTS,
  error: ROUTES.ERROR,
};
