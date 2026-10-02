import '@testing-library/jest-dom';

// Polyfill ResizeObserver for JSDOM and motion/react layout animations
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock;
window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;

// Polyfill IntersectionObserver
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = global.IntersectionObserver || IntersectionObserverMock;
window.IntersectionObserver = window.IntersectionObserver || IntersectionObserverMock;

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Polyfill SVG methods for motion.path and SVG elements in JSDOM
if (typeof window !== 'undefined') {
  const svgProto = window.SVGElement?.prototype as any;
  if (svgProto && !svgProto.getBBox) {
    svgProto.getBBox = () => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => {},
    });
  }

  const svgPathProto = window.SVGPathElement?.prototype as any;
  if (svgPathProto && !svgPathProto.getTotalLength) {
    svgPathProto.getTotalLength = () => 100;
  }
}
