const brands: string[] = ['Tesla', 'Mersedes', 'BMW', 'Toyota', 'Zhiguli', 'Moskvich', 'Opel', 'Aston Martin', 'Porshe'];
const models: string[] = ['Model S', 'CLK', '7', 'Camry', 'Combi', '9', 'Corsa', 'DB9', 'Cayene'];

export const getRandomName = () => {
  const randomIndex = Math.floor(Math.random() * brands.length);
  const brand: string = brands[randomIndex];
  const model: string = models[randomIndex];
  return `${brand} ${model}`;
};

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// animation
const getPositionCenter = (el: HTMLElement) => {
  const {
    top, left, width, height,
  } = el.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2,
  };
};

export const getDistanceBetweenElements = (a: HTMLElement, b: HTMLElement) => {
  const aPosition = getPositionCenter(a);
  const bPosition = getPositionCenter(b);
  return Math.hypot(aPosition.x - bPosition.x, aPosition.y - bPosition.y);
};
