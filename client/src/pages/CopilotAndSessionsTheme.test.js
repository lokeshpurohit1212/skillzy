import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock axios before importing files that use it
jest.mock('axios', () => {
  const mAxios = {
    create: jest.fn(() => mAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  };
  return mAxios;
});

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

const Copilot = require('./Copilot').default;
const Sessions = require('./Sessions').default;
const api = require('../config/api').default;

describe('Copilot and Sessions Dark Mode Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Copilot page with dark mode container classes and UI elements', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          _id: 'road-1',
          skillName: 'Machine Learning',
          currentProficiency: 'Beginner',
          targetProficiency: 'Advanced',
          progressPercentage: 45,
          weeklyCommitmentHours: 10,
          learningStyle: 'hands-on',
          milestones: [
            {
              id: 'm1',
              title: 'Data Preprocessing',
              description: 'Pandas and NumPy mastery',
              completed: true,
              practiceExercises: ['Exercise 1'],
              suggestedSessionTopics: ['Feature Scaling']
            }
          ]
        }
      ]
    });

    const { container } = render(
      <BrowserRouter>
        <Copilot />
      </BrowserRouter>
    );

    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('dark:bg-[#0F0D15]');
    expect(mainContainer).toHaveClass('dark:text-[#F5F2FA]');

    const heading = await screen.findByText(/Personalized Roadmaps/i);
    expect(heading).toHaveClass('dark:text-[#F5F2FA]');

    await waitFor(() => {
      expect(screen.getAllByText('Machine Learning').length).toBeGreaterThan(0);
    });

    const milestoneTitle = screen.getByText(/Milestone 1: Data Preprocessing/i);
    expect(milestoneTitle).toBeInTheDocument();
  });

  it('renders Sessions page with dark mode container classes and UI elements', async () => {
    api.get
      .mockResolvedValueOnce({ data: { _id: 'u1', name: 'Dev Malhotra' } }) // /auth/me
      .mockResolvedValueOnce({ // /sessions
        data: [
          {
            _id: 's1',
            organizer: { _id: 'u1', name: 'Dev Malhotra' },
            participant: { _id: 'u2', name: 'Aditi Kulkarni' },
            skillTopic: 'React Performance',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 60,
            status: 'scheduled',
            notes: 'Deep dive into useMemo'
          }
        ]
      })
      .mockResolvedValueOnce({ data: [] }); // /swaps/my-swaps

    const { container } = render(
      <BrowserRouter>
        <Sessions />
      </BrowserRouter>
    );

    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('dark:bg-[#0F0D15]');
    expect(mainContainer).toHaveClass('dark:text-[#F5F2FA]');

    const heading = await screen.findByText(/Smart Session Scheduling/i);
    expect(heading).toHaveClass('dark:text-[#F5F2FA]');

    await waitFor(() => {
      expect(screen.getByText('React Performance')).toBeInTheDocument();
      expect(screen.getByText('Aditi Kulkarni')).toBeInTheDocument();
      expect(screen.getByText('Enter Classroom')).toBeInTheDocument();
    });
  });
});
