import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ReactionBoardActivity } from '../../../src/screens/activities/ReactionBoardActivity';

jest.mock('../../../src/services/teamContext', () => ({
  useTeam: jest.fn(() => ({
    team: {
      id: 'team-1',
      teamName: 'Team One',
    },
  })),
}));

describe('ReactionBoardActivity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('prevents premature taps before the reaction cue appears', () => {
    const { getByText, queryByText } = render(<ReactionBoardActivity onBack={jest.fn()} />);

    fireEvent.press(getByText('Start Test'));
    fireEvent.press(getByText('Start'));

    expect(getByText('Get ready...')).toBeTruthy();
    expect(queryByText(/1\. \d+ms/)).toBeNull();
  });

  it('logs a reaction after the cue appears', async () => {
    const { getByText } = render(<ReactionBoardActivity onBack={jest.fn()} />);

    fireEvent.press(getByText('Start Test'));
    fireEvent.press(getByText('Start'));
    act(() => jest.advanceTimersByTime(1000));
    fireEvent.press(getByText('TAP NOW!'));

    await waitFor(() => expect(getByText(/1\. \d+ms/)).toBeTruthy());
  });
});
