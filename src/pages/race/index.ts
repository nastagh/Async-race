import { Router, PAGES } from '../../application';
import Template from './index.html';
import './race.scss';
import { RaceService } from '../../services/raceService';
import { Store } from '../../store';
import { GarageService } from '../../services/garageService';
import { carImgWinner } from './image';
import { CarData } from '../garage/car';

export interface WinnerData{
  id: number,
  wins: number,
  time: number
}
export interface RacePageState {
  pageNumber: number,
  winners: WinnerData[],
}

enum NavigationWinnersButtons {
  GARAGE = 'garage',
  PREV = 'prev',
  NEXT = 'next',
  WINS = 'wins',
  TIME = 'time',
}

export class PageRace {
    router: Router;

    position: number;

    raceService: RaceService;

    garageService: GarageService;

    winners: WinnerData[];

    cars: CarData[];

    winnerOnPage: WinnerData[] =[];

    pageNumber: number;

    countDrawWinners: number;

    navigationWinnersButtonsLogic: Record<NavigationWinnersButtons, () => unknown>;

    stateStore: RacePageState;

    isWins = true;

    isTime = true;

    constructor(
      router: Router,
      raceService: RaceService,
      garageService: GarageService,
      store: Store,
    ) {
      this.router = router;
      this.raceService = raceService;
      this.garageService = garageService;
      this.position = 0;
      this.pageNumber = 1;
      this.countDrawWinners = 10;

      this.navigationWinnersButtonsLogic = {
        [NavigationWinnersButtons.GARAGE]: this.changePage.bind(this),
        [NavigationWinnersButtons.NEXT]: this.drawNextPage.bind(this),
        [NavigationWinnersButtons.PREV]: this.drawPrevPage.bind(this),
        [NavigationWinnersButtons.WINS]: this.sortByWins.bind(this),
        [NavigationWinnersButtons.TIME]: this.sortByTime.bind(this),
      };

      if (store.has(PAGES.RACE)) {
        this.stateStore = store.getPageStore<RacePageState>(PAGES.RACE);
        this.loadState();
      } else {
        this.stateStore = store.addPageStore<RacePageState>(PAGES.RACE, {
          winners: null,
          pageNumber: 1,
        });
      }

      this.init();
    }

    async init() {
      // if (!this.winners) {
      this.winners = await this.raceService.getWinners();
      // }
      this.render();
    }

    async render() {
      this.saveState();
      const root = document.getElementById('root') as HTMLDivElement;

      const wrapper = document.createElement('div');

      wrapper.innerHTML = Template;

      const pageNodes = wrapper.firstChild as Node;

      root.innerHTML = '';

      root.appendChild(pageNodes);

      const table = document.querySelector('.winners-container');
      const cars = await this.garageService.getCars();

      pageNodes.addEventListener('click', (e) => this.handler(e));

      this.winnerOnPage = [];

      const pageNumberContainer: HTMLElement = document.getElementById('page-number');
      pageNumberContainer.innerHTML = `#${this.pageNumber}`;

      for (let i = 0; i < this.countDrawWinners; i += 1) {
        const el = this.winners[(this.pageNumber - 1) * this.countDrawWinners + i];
        this.position += 1;
        if (el) {
          const [carWinner] = cars.filter((car: CarData) => car.id === el.id);
          table.appendChild(this.createWinnerHtml(el, carWinner));
          this.winnerOnPage.push(el);
        }
      }

      const winnersAmount: HTMLElement = document.getElementById('winners');
      winnersAmount.innerHTML = ` (${this.winners.length})`;

      const prevButton = document.getElementById('prev') as HTMLButtonElement;
      const nextButton = document.getElementById('next') as HTMLButtonElement;
      if (this.pageNumber > 1) {
        prevButton.disabled = false;
      }
      if (this.pageNumber > (this.winners.length - 1) / this.countDrawWinners) {
        nextButton.disabled = true;
      }
      if (this.pageNumber === 1) {
        prevButton.disabled = true;
      }
    }

    changePage() {
      return this.router.push('garage');
    }

    handler(e: Event) {
      if (e.target instanceof HTMLButtonElement) {
        this.navigationWinnersButtonsLogic[e.target.value as NavigationWinnersButtons]();
      }
    }

    createWinnerHtml(winner: WinnerData, car: CarData): HTMLElement {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${this.position}</td>
      <td>${carImgWinner(car.color)}</td>
      <td>${car.name}</td>
      <td>${winner.wins}</td>
      <td>${winner.time / 1000}</td>`;

      return tr;
    }

    drawNextPage() {
      this.pageNumber += 1;
      this.render();
    }

    drawPrevPage() {
      this.pageNumber -= 1;
      if (this.pageNumber === 1) {
        this.position = 0;
      }
      this.render();
    }

    private saveState() {
      this.stateStore.winners = [...this.winners];
      this.stateStore.pageNumber = this.pageNumber;
    }

    loadState() {
      if (this.stateStore.winners) {
        this.winners = [...this.stateStore.winners];
      }

      this.pageNumber = this.stateStore.pageNumber;
    }

    async sortByWins() {
      if (this.isWins) {
        this.winners = await this.raceService.sortWinnersAsc(NavigationWinnersButtons.WINS);
      } else {
        this.winners = await this.raceService.sortWinnersDesc(NavigationWinnersButtons.WINS);
      }
      this.isWins = !this.isWins;
      this.position = 0;
      this.pageNumber = 1;
      this.render();
    }

    async sortByTime() {
      if (this.isTime) {
        this.winners = await this.raceService.sortWinnersAsc(NavigationWinnersButtons.TIME);
      } else {
        this.winners = await this.raceService.sortWinnersDesc(NavigationWinnersButtons.TIME);
      }
      this.isTime = !this.isTime;
      this.position = 0;
      this.pageNumber = 1;
      this.render();
    }
}
