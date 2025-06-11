import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './index'; // Assuming App is a named export from index.tsx

describe('App Component', () => {
  test('renders main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Gemini AI Desktop/i);
    expect(headingElement).toBeInTheDocument();
  });
});
