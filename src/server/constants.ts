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
