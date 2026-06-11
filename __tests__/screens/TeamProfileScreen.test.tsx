import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { TeamProfileScreen } from '../../src/screens/TeamProfileScreen';
import { fetchExperimentRecordsForTeam } from '../../src/services/firestoreService';

jest.mock('../../src/services/firestoreService', () => ({
  fetchExperimentRecordsForTeam: jest.fn(),
}));

jest.mock('../../src/services/teamContext', () => ({
  formatTeamDisplayId: jest.fn(() => 'STEMM Testing #1234'),
  useTeam: jest.fn(() => ({
    team: {
      id: 'team-1',
      teamName: 'STEMM Testing',
      representativeEmail: 'testing@example.com',
      members: ['Ivy', 'Rai'],
      gradeLevel: '7',
      createdAt: 100,
    },
  })),
}));

describe('TeamProfileScreen', () => {
  it('renders team profile details', async () => {
    jest.mocked(fetchExperimentRecordsForTeam).mockResolvedValueOnce([]);
    const { getByText } = render(<TeamProfileScreen onBack={jest.fn()} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(getByText('STEMM Testing #1234')).toBeTruthy();
    expect(getByText('STEMM Testing')).toBeTruthy();
    expect(getByText('testing@example.com')).toBeTruthy();
    expect(getByText('Ivy')).toBeTruthy();
    expect(fetchExperimentRecordsForTeam).toHaveBeenCalledWith('team-1');
  });

  it('waits for Reaction Board to render and opens selected record details', async () => {
    jest.mocked(fetchExperimentRecordsForTeam).mockResolvedValueOnce([
      {
        id: 'record-reaction-1',
        teamId: 'team-1',
        activityId: 'reaction',
        score: 4,
        timestamp: 1717550400000,
        details: { type: 'reflection', reflection: { rating: 4, answers: { q: 'a' } } },
      },
    ]);
    const { getAllByText, getByLabelText, getByText } = render(<TeamProfileScreen onBack={jest.fn()} />);

    await waitFor(() => expect(getByText('Reaction Board')).toBeTruthy(), { timeout: 4000 });
    await act(async () => {
      fireEvent.press(getByLabelText('Open Reaction Board record'));
    });

    await waitFor(() => expect(getByText('Record ID')).toBeTruthy(), { timeout: 4000 });
    expect(getByText('record-reaction-1')).toBeTruthy();
    expect(getAllByText('Type').length).toBeGreaterThan(0);
  }, 8000);
});
