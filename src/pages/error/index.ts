import { Router } from '../../application';
import Template from './index.html';

export class PageError {
    router: Router;

    constructor(router: Router) {
      this.router = router;

      this.init();
    }

    init() {
      const root = document.getElementById('root') as HTMLDivElement;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = Template;
      const pageNodes = wrapper.firstChild as Node;

      root.innerHTML = '';

      root.appendChild(pageNodes);

      this.router.subscribe(() => {
        console.log('route changes error');
      });
    }
}
