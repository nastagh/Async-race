import { CarData } from '../pages/garage/car';

export const baseUrl = 'http://127.0.0.1:3000';

export const path = {
  garage: '/garage',
  engine: '/engine',
  winners: '/winners',
};

export class GarageService {
  async getCars(): Promise<CarData[]> {
    const response = await fetch(`${baseUrl}${path.garage}`);
    return response.json();
  }

  async createCar(car: CarData): Promise<CarData> {
    const response = await fetch(`${baseUrl}${path.garage}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car),
    });
    return response.json();
  }

  async deleteCar(id: number) {
    const response = await fetch(`${baseUrl}${path.garage}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async updateCar(car: CarData) {
    const response = await fetch(`${baseUrl}${path.garage}/${car.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car),
    });
    return response.json();
  }

  async startEngine(id: number) {
    const response = await fetch(`${baseUrl}${path.engine}?id=${id}&status=started`, {
      method: 'PATCH',
    });
    return response.json();
  }

  async stopEngine(id: number) {
    const response = await fetch(`${baseUrl}${path.engine}?id=${id}&status=stopped`, {
      method: 'PATCH',
    });
    return response.json();
  }

  async drive(id: number): Promise<{id: number, success: boolean, time: number}> {
    const response = await fetch(`${baseUrl}${path.engine}?id=${id}&status=drive`, {
      method: 'PATCH',
    });

    return response.status !== 200 ? { success: false } : { ...(await response.json()) };
  }
}
