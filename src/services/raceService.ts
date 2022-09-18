import { baseUrl, path } from './garageService';
import { WinnerData } from '../pages/race';

export class RaceService {
  async getWinner(id: number) {
    const response = await fetch(`${baseUrl}${path.winners}/${id}`);
    return response.json();
  }

  async getWinners(): Promise<WinnerData[]> {
    const response = await fetch(`${baseUrl}${path.winners}`);
    return response.json();
  }

  async getWinnerStatus(id: number) {
    const response = await fetch(`${baseUrl}${path.winners}/${id}`);
    return response.status;
  }

  async createWinner(winner: WinnerData) {
    const response = await fetch(`${baseUrl}${path.winners}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winner),
    });
    return response.json();
  }

  async deleteWinner(id: number) {
    const response = await fetch(`${baseUrl}${path.winners}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async updateWinner(winner: WinnerData) {
    const response = await fetch(`${baseUrl}${path.winners}/${winner.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winner),
    });
    return response.json();
  }

  async saveWinners(id: number, time: number) {
    const winnerStatus = await this.getWinnerStatus(id);

    if (winnerStatus === 404) {
      await this.createWinner({
        id,
        wins: 1,
        time,
      });
    } else {
      const winner = await this.getWinner(id);
      await this.updateWinner({
        id,
        wins: winner.wins + 1,
        time: time < winner.time ? time : winner.time,
      });
    }
  }

  async sortWinnersAsc(type: string) {
    const response = await fetch(`${baseUrl}${path.winners}?_sort=${type}&_order=asc`);
    return response.json();
  }

  async sortWinnersDesc(type: string) {
    const response = await fetch(`${baseUrl}${path.winners}?_sort=${type}&_order=desc`);
    return response.json();
  }
}
