import { render, screen } from '@testing-library/react';
import { App } from './index'; // Assuming App is exported from index.tsx
import React from 'react';

describe('App component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check for a distinctive element from the App component
    // For example, the main heading:
    expect(screen.getByText('Gemini AI Desktop')).toBeInTheDocument();
  });
});
