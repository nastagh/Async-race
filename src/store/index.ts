export class Store {
    private store = new Map();

    addPageStore<T>(key: string, initData: T): T {
      this.store.set(key, initData);

      return this.store.get(key) as T;
    }

    getPageStore<T>(key: string): T {
      return this.store.get(key) as T;
    }

    has(key: string) {
      return this.store.has(key);
    }
}
