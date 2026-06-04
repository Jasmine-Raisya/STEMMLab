import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ReactionBoardActivity } from '../../../src/screens/activities/ReactionBoardActivity';

jest.mock('../../../src/services/teamContext', () => ({
  useTeam: () => ({ team: { id: 'team-1', teamName: 'STEMM Team' } }),
}));

describe('ReactionBoardActivity', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: 1000 });
    jest.spyOn(global.Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('moves from phase selection into the reaction board', () => {
    const { getByText } = render(<ReactionBoardActivity onBack={jest.fn()} />);

    fireEvent.press(getByText('Start Test'));

    expect(getByText('Reaction Board')).toBeTruthy();
    expect(getByText('Get ready...')).toBeTruthy();
  });

  it('records and displays a reaction result after the timer becomes ready', () => {
    const { getByText } = render(<ReactionBoardActivity onBack={jest.fn()} />);

    fireEvent.press(getByText('Start Test'));

    act(() => {
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(240);
    });

    fireEvent.press(getByText('TAP NOW!'));

    expect(getByText('240ms')).toBeTruthy();
    expect(getByText('Great reaction!')).toBeTruthy();
  });
});
