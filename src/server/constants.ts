export enum SIZE {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
};

export const SIZE_LABELS: { [key in SIZE]: string } = {
  [SIZE.S]: 'Small (S)',
  [SIZE.M]: 'Medium (M)',
  [SIZE.L]: 'Large (L)',
  [SIZE.XL]: 'Extra large (XL)',
};

export const MESSAGE = "It's Tricky to rock a rhyme, to rock a rhyme that's right on time, it's Tricky";