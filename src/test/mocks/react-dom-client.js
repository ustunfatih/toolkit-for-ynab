const createRoot = jest.fn(() => ({
  render: jest.fn(),
  unmount: jest.fn(),
}));

export { createRoot };
