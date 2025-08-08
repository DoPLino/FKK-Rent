// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock window.location
delete window.location;
window.location = {
  href: '',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
};

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Custom matchers for testing
expect.extend({
  toHaveClass(received, ...expectedClasses) {
    const pass = expectedClasses.every(className =>
      received.classList.contains(className)
    );
    
    if (pass) {
      return {
        message: () =>
          `expected element not to have classes: ${expectedClasses.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have classes: ${expectedClasses.join(', ')}`,
        pass: false,
      };
    }
  },
  
  toHaveStyle(received, expectedStyles) {
    const computedStyle = window.getComputedStyle(received);
    const pass = Object.entries(expectedStyles).every(([property, value]) =>
      computedStyle.getPropertyValue(property) === value
    );
    
    if (pass) {
      return {
        message: () =>
          `expected element not to have styles: ${JSON.stringify(expectedStyles)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have styles: ${JSON.stringify(expectedStyles)}`,
        pass: false,
      };
    }
  },
  
  toBeInViewport(received) {
    const rect = received.getBoundingClientRect();
    const pass = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
    
    if (pass) {
      return {
        message: () => 'expected element not to be in viewport',
        pass: true,
      };
    } else {
      return {
        message: () => 'expected element to be in viewport',
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  // Wait for element to be present
  waitForElement: (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      checkElement();
    });
  },
  
  // Wait for condition to be true
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCondition = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Condition not met within ${timeout}ms`));
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      
      checkCondition();
    });
  },
  
  // Mock API responses
  mockApiResponse: (url, response) => {
    return {
      url,
      response,
      method: 'GET',
    };
  },
  
  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'user',
    ...overrides,
  }),
  
  // Create mock equipment
  createMockEquipment: (overrides = {}) => ({
    id: '1',
    name: 'Test Camera',
    category: 'Camera',
    serialNumber: 'CAM001',
    status: 'available',
    location: 'Studio A',
    ...overrides,
  }),
  
  // Create mock booking
  createMockBooking: (overrides = {}) => ({
    id: '1',
    equipment: { id: '1', name: 'Test Camera' },
    user: { id: '1', firstName: 'John', lastName: 'Doe' },
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    status: 'pending',
    ...overrides,
  }),
};
