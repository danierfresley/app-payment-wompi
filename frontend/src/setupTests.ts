import { TextDecoder, TextEncoder } from 'util';
import '@testing-library/jest-dom';

Object.assign(global, { TextEncoder, TextDecoder });
Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
