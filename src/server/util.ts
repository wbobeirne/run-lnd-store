// Provides array of enum keys typed correctly
export function typedKeys<T extends object>(e: T): Array<keyof T> {
  return Object.keys(e).map(k => k as keyof T);
}

// Turns 1000 into "1,000"
export function commaify(text: string | number) {
  const pieces = text.toString().split('.');
  pieces[0] = pieces[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return pieces.join('.');
}

export function rHashBufferToStr(rHash: any): string {
  return Buffer.from(rHash as Uint8Array).toString('hex')
}
