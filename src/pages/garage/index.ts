import { GarageService } from '../../services/garageService';
import { Router, PAGES } from '../../application';
import Template from './index.html';
import './garage.scss';
import { Car, CarData, CarButtons } from './car';
import { getRandomColor, getRandomName } from './utils';
import { RaceService } from '../../services/raceService';
import { Store } from '../../store';

enum NavigationButtons {
    WINNERS = 'winners',
    CREATE = 'create',
    UPDATE = 'update',
    RACE = 'race',
    RESET = 'reset',
    GENERATE = 'generate',
    PREV = 'prev',
    NEXT = 'next',
}

export interface GaragePageState {
  pageNumber: number,
  cars: Car[],
}

export class PageGarage {
    garageService: GarageService;

    raceService: RaceService;

    router: Router;

    cars: Car[];

    countDrawCars: number;

    carButtonsLogic: Record<CarButtons, (id: number) => void>;

    navigationButtonsLogic: Record<NavigationButtons, () => unknown>;

    selectedCar: Car;

    selectInputUpdate: HTMLInputElement;

    selectInputCreate: HTMLInputElement;

    colorInputUpdate: HTMLInputElement;

    colorInputCreate: HTMLInputElement;

    pageNumber: number;

    drivingCar: Car;

    carsOnPage: Car[] = [];

    stateStore: GaragePageState;

    constructor(
      garageService: GarageService,
      raceService: RaceService,
      router: Router,
      store: Store,
    ) {
      this.garageService = garageService;
      this.raceService = raceService;
      this.router = router;

      this.carButtonsLogic = {
        [CarButtons.REMOVE]: this.removeCarHandler.bind(this),
        [CarButtons.SELECT]: this.selectCar.bind(this),
        [CarButtons.A]: this.startDriving.bind(this),
        [CarButtons.B]: this.stopDriving.bind(this),
      };

      this.navigationButtonsLogic = {
        [NavigationButtons.WINNERS]: this.changePage.bind(this),
        [NavigationButtons.CREATE]: this.createCarHandler.bind(this),
        [NavigationButtons.UPDATE]: this.updateCarHandler.bind(this),
        [NavigationButtons.RACE]: this.raceAll.bind(this),
        [NavigationButtons.RESET]: this.reset.bind(this),
        [NavigationButtons.GENERATE]: this.generateRandomCar.bind(this),
        [NavigationButtons.PREV]: this.drawPrevPage.bind(this),
        [NavigationButtons.NEXT]: this.drawNextPage.bind(this),
      };

      this.countDrawCars = 7;
      this.pageNumber = 1;

      if (store.has(PAGES.GARAGE)) {
        this.stateStore = store.getPageStore<GaragePageState>(PAGES.GARAGE);
        this.loadState();
      } else {
        this.stateStore = store.addPageStore<GaragePageState>(PAGES.GARAGE, {
          cars: null,
          pageNumber: 1,
        });
      }

      this.init();
    }

    async init() {
      if (!this.cars) {
        this.cars = (await this.garageService.getCars()).map((el: CarData) => new Car(el));
      }
      this.render();
    }

    changePage() {
      return this.router.push('race');
    }

    render() {
      this.saveState();
      const root = document.getElementById('root') as HTMLDivElement;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = Template;
      const pageNodes = wrapper.firstChild as Node;
      root.innerHTML = '';

      root.appendChild(pageNodes);

      pageNodes.addEventListener('click', (e) => this.handler(e));

      const carsAmount: HTMLElement = document.getElementById('cars-amount');
      carsAmount.innerHTML = ` (${this.cars.length})`;
      const carsContainer = document.getElementById('cars') as HTMLDivElement;

      carsContainer.addEventListener('click', (e) => this.carContainerClickHandler(e));
      this.carsOnPage = [];

      for (let i = 0; i < this.countDrawCars; i += 1) {
        const el = this.cars[(this.pageNumber - 1) * this.countDrawCars + i];
        if (el) {
          carsContainer.appendChild(el.html);
          this.carsOnPage.push(el);
        }
      }

      const prevButton = document.getElementById('prev') as HTMLButtonElement;
      const nextButton = document.getElementById('next') as HTMLButtonElement;
      if (this.pageNumber > 1) {
        prevButton.disabled = false;
      }
      if (this.pageNumber > (this.cars.length - 1) / this.countDrawCars) {
        nextButton.disabled = true;
      }
      if (this.pageNumber === 1) {
        prevButton.disabled = true;
      }

      const pageNumberContainer: HTMLElement = document.getElementById('page-number');
      pageNumberContainer.innerHTML = `#${this.pageNumber}`;
    }

    async addNewCar() {
      this.colorInputCreate = document.querySelector('.createColor') as HTMLInputElement;
      this.selectInputCreate = document.querySelector('.createText') as HTMLInputElement;
      const car = await this.garageService.createCar({
        name: this.selectInputCreate.value,
        color: this.colorInputCreate.value,
      });

      return new Car(car);
    }

    async createCarHandler() {
      const car = await this.addNewCar();
      this.cars.push(car);
      this.render();
    }

    handler(e: Event) {
      if (e.target instanceof HTMLButtonElement) {
        this.navigationButtonsLogic[e.target.value as NavigationButtons]();
      }
    }

    carContainerClickHandler(e: Event) {
      e.stopPropagation();
      if (e.target instanceof HTMLButtonElement) {
        const button = e.target;
        const container = button.closest('.car-container');

        this.carButtonsLogic[e.target.value as CarButtons](parseInt(container.id, 10));
      }
    }

    async removeCarHandler(id: number) {
      await this.garageService.deleteCar(id);
      await this.raceService.deleteWinner(id);
      this.reloadState();
    }

    async generateRandomCar(count = 100) {
      const arr = [];
      for (let i = 0; i < count; i += 1) {
        const car = this.garageService.createCar({
          name: getRandomName(),
          color: getRandomColor(),
        });
        arr.push(car);
      }
      await Promise.all(arr);
      this.reloadState();
      return arr;
    }

    selectCar(id: number) {
      this.selectInputUpdate = document.querySelector('.updateText') as HTMLInputElement;
      this.selectInputUpdate.focus();
      this.colorInputUpdate = document.querySelector('.updateColor') as HTMLInputElement;
      [this.selectedCar] = this.cars.filter((el:Car) => id === el.id);
      this.selectInputUpdate.value = this.selectedCar.name;
      this.colorInputUpdate.value = this.selectedCar.color;
    }

    async updateCarHandler() {
      if (this.selectedCar) {
        this.selectedCar.setColor(this.colorInputUpdate.value);
        this.selectedCar.setName(this.selectInputUpdate.value);
        await this.garageService.updateCar(this.selectedCar.toJson());
        this.selectInputUpdate.value = '';
      }
    }

    drawNextPage() {
      this.pageNumber += 1;
      this.render();
    }

    drawPrevPage() {
      this.pageNumber -= 1;
      this.render();
    }

    private saveState() {
      this.stateStore.cars = [...this.cars];
      this.stateStore.pageNumber = this.pageNumber;
    }

    loadState() {
      if (this.stateStore.cars) {
        this.cars = [...this.stateStore.cars];
      }

      this.pageNumber = this.stateStore.pageNumber;
    }

    async reloadState() {
      this.cars = (await this.garageService.getCars()).map((el: CarData) => new Car(el));
      this.render();
    }

    async startDriving(id: number) {
      const startButton = document.getElementById(`start-button-${id}`) as HTMLButtonElement;
      startButton.disabled = true;

      const stopButton = document.getElementById(`stop-button-${id}`) as HTMLButtonElement;
      stopButton.disabled = false;

      const { velocity, distance } = await this.garageService.startEngine(id);
      const time = Math.round(distance / velocity);

      [this.drivingCar] = this.cars.filter((el:Car) => id === el.id);
      this.drivingCar.start(time);

      const { success } = await this.garageService.drive(id);

      if (!success) {
        this.drivingCar.stopEngine();
      }

      return { success, id, time };
    }

    async stopDriving(id: number) {
      const stopButton = document.getElementById(`stop-button-${id}`) as HTMLButtonElement;
      stopButton.disabled = true;
      const startButton = document.getElementById(`start-button-${id}`) as HTMLButtonElement;
      startButton.disabled = false;
      await this.garageService.stopEngine(id);
      [this.drivingCar] = this.cars.filter((el:Car) => id === el.id);
      this.drivingCar.moveToStart();

      this.drivingCar.stopEngine();
    }

    async raceAll() {
      const resetButton = document.getElementById('reset') as HTMLButtonElement;
      const raceButton = document.getElementById('race') as HTMLButtonElement;
      raceButton.disabled = true;
      const promises = this.carsOnPage.map((el) => new Promise((resolve, reject) => {
        this.startDriving(el.id)
          .then((result) => {
            if (result.success) {
              resolve(result);
            } else {
              reject(result);
            }
          });
      }));

      const first = await Promise.any(promises) as {id: number, time: number, success: boolean};
      await this.raceService.saveWinners(first.id, first.time);
      resetButton.disabled = false;
      const winnerText = document.querySelector('.winner') as HTMLElement;
      winnerText.classList.toggle('hidden');
      const [winnerCar] = this.carsOnPage.filter((el: Car) => first.id === el.id);
      winnerText.innerHTML = `${winnerCar.name} went first [${first.time / 1000}s]`;
    }

    reset() {
      const resetButton = document.getElementById('reset') as HTMLButtonElement;
      const raceButton = document.getElementById('race') as HTMLButtonElement;
      resetButton.disabled = true;
      raceButton.disabled = false;
      this.carsOnPage.forEach((el: Car) => this.stopDriving(el.id));
      const winnerText = document.querySelector('.winner') as HTMLElement;
      winnerText.classList.toggle('hidden');
    }
}
