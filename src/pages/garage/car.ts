import { carImg, flagImg } from './image';
import { getDistanceBetweenElements } from './utils';

export interface CarData {
    name: string;
    color: string;
    id?: number;
}

export enum CarButtons {
  SELECT = 'select',
  REMOVE = 'remove',
  A = 'A',
  B = 'B',
}

export class Car {
  public name: string;

  public color:string;

  public id: number;

  public readonly html: HTMLElement;

  divCarContainer:HTMLElement;

  animationID: number;

  constructor({ name, color, id }: CarData) {
    this.name = name;
    this.color = color;
    this.id = id;
    this.html = this.createCarHtml();
    this.divCarContainer = this.html.querySelector('.car-image');
  }

  private createCarHtml(): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('car-container');
    div.id = this.id.toString();
    div.innerHTML = `<div> <button value="select">select</button>
     <button value="remove">remove</button>
     <span class="car-name">${this.name}</span>
     </div>
     <div class="container-race">
     <div>
     <button value="A" id ="start-button-${this.id}">A</button>
     <button disable value="B" disabled id="stop-button-${this.id}">B</button>
     </div>
     <div class="car-image">${carImg(this.color)}</div>
     </div>
     <div class="flag-container">
     ${flagImg}
     </div>`;

    return div;
  }

  setColor(color: string) {
    this.color = color;
    // this.divCarContainer = this.html.querySelector('.car-image');
    this.divCarContainer.innerHTML = carImg(this.color);
  }

  setName(name: string) {
    this.name = name;
    const span = this.html.querySelector('.car-name');
    span.innerHTML = this.name;
  }

  toJson() {
    return {
      name: this.name,
      color: this.color,
      id: this.id,
    };
  }

  start(animationTime: number) {
    const divFlagContainer = this.html.querySelector('.flag-container') as HTMLElement;
    const htmlDistance = Math.floor(getDistanceBetweenElements(
      this.divCarContainer,
      divFlagContainer,
    )) + 100;

    let start: null | number = null;

    const step = (timeStep: number) => {
      if (!start) start = timeStep;
      const time = timeStep - start;
      const passed = Math.round(time * (htmlDistance / animationTime));
      this.divCarContainer.style.transform = `translateX(${Math.min(passed, htmlDistance)}px)`;
      if (passed < htmlDistance) {
        this.animationID = window.requestAnimationFrame(step);
      }
    };
    this.animationID = window.requestAnimationFrame(step);
  }

  stopEngine() {
    if (this.animationID) window.cancelAnimationFrame(this.animationID);
  }

  moveToStart() {
    this.divCarContainer.style.transform = 'translateX(0)';
  }
}
