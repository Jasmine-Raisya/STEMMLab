import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { TeamProfileScreen } from '../../src/screens/TeamProfileScreen';
import { fetchExperimentRecordsForTeam } from '../../src/services/firestoreService';

jest.mock('../../src/services/teamContext', () => ({
  useTeam: jest.fn(() => ({
    team: {
      id: 'team-1',
      authUid: 'uid-1',
      representativeEmail: 'team@example.com',
      teamName: 'Newton Squad',
      members: ['Ari', 'Bima'],
      gradeLevel: '7',
      createdAt: 100,
    },
  })),
}));

jest.mock('../../src/services/firestoreService', () => ({
  fetchExperimentRecordsForTeam: jest.fn(async () => [
    {
      id: 'team-1_reflection_reaction_3',
      teamId: 'team-1',
      activityId: 'reaction',
      score: 4,
      timestamp: 1700000000000,
      details: {
        type: 'reflection',
        reflection: {
          rating: 4,
          answers: {
            observation: 'The second trial was faster.',
          },
        },
      },
    },
  ]),
}));

describe('TeamProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows experiment history previews and opens selected record details', async () => {
    const { getByText } = render(<TeamProfileScreen onBack={jest.fn()} />);

    await waitFor(() => expect(fetchExperimentRecordsForTeam).toHaveBeenCalledWith('team-1'));
    expect(getByText('Experiment Records')).toBeTruthy();
    expect(getByText('Reaction Board')).toBeTruthy();
    expect(getByText(/Reflection \|/)).toBeTruthy();
    expect(getByText('4')).toBeTruthy();

    fireEvent.press(getByText('Reaction Board'));

    expect(getByText('Record ID')).toBeTruthy();
    expect(getByText('team-1_reflection_reaction_3')).toBeTruthy();
    expect(getByText(/The second trial was faster/)).toBeTruthy();
  });
});
