import React from 'react';
import { act, render } from '@testing-library/react';
import App from './App';

test('renders header', async () => {
  // components with 'useEffect' need to be awaited
  const container = render(<div />);
  await act(async () => {
    render(<App />, container);
  });
  const titleElement = container.getByText(/Workflow-Planer Formular-Editor/i);
  expect(titleElement).toBeInTheDocument();
});
