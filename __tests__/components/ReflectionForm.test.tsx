import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ReflectionForm } from '../../src/components/ReflectionForm';
import { insertActivityReflection } from '../../src/services/localDb';
import { syncPendingLocalData } from '../../src/services/syncService';

jest.mock('../../src/services/localDb', () => ({
  insertActivityReflection: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/syncService', () => ({
  syncPendingLocalData: jest.fn(async () => ({ skipped: false, samples: 0, logs: 0, reflections: 1 })),
}));

describe('ReflectionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders every question field and keeps save disabled while incomplete', () => {
    const { getByText, getAllByPlaceholderText } = render(
      <ReflectionForm
        activityId="reaction"
        teamId="team-1"
        questions={['What changed?', 'What evidence did you collect?']}
        onSaved={jest.fn()}
      />,
    );

    expect(getByText('What changed?')).toBeTruthy();
    expect(getByText('What evidence did you collect?')).toBeTruthy();
    expect(getAllByPlaceholderText('Type your answer')).toHaveLength(2);
    expect(getByText('Save Reflection')).toBeDisabled();
  });

  it('updates star rating state and submits a completed reflection', async () => {
    const onSaved = jest.fn();
    const { getAllByText, getByPlaceholderText, getByText } = render(
      <ReflectionForm
        activityId="reaction"
        teamId="team-1"
        questions={['What changed?']}
        onSaved={onSaved}
        ratingStyle="stars"
      />,
    );

    fireEvent.press(getAllByText('★')[3]);
    fireEvent.changeText(getByPlaceholderText('Type your answer'), 'My timing improved after the warm-up.');
    fireEvent.press(getByText('Save Reflection'));

    await waitFor(() => expect(insertActivityReflection).toHaveBeenCalled());
    expect(syncPendingLocalData).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
