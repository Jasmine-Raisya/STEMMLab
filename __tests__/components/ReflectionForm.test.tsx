import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ReflectionForm } from '../../src/components/ReflectionForm';
import { insertActivityReflection } from '../../src/services/localDb';

jest.mock('../../src/services/localDb', () => ({
  deleteExperimentDraft: jest.fn(async () => undefined),
  getExperimentDraft: jest.fn(async () => null),
  insertActivityReflection: jest.fn(async () => undefined),
  saveExperimentDraft: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/syncService', () => ({
  syncPendingLocalData: jest.fn(async () => ({ skipped: false })),
}));

describe('ReflectionForm', () => {
  it('enables saving after rating and answer are completed', async () => {
    const onSaved = jest.fn();
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(
      <ReflectionForm activityId="sound" teamId="team-1" questions={['What happened?']} onSaved={onSaved} />,
    );

    fireEvent.press(getByText('5'));
    fireEvent.changeText(getByPlaceholderText('Type your answer'), 'It worked.');

    expect(getByDisplayValue('It worked.')).toBeTruthy();
    fireEvent.press(getByText('Save Reflection'));

    await waitFor(() => expect(insertActivityReflection).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'sound',
      teamId: 'team-1',
      rating: 5,
      answers: { 'What happened?': 'It worked.' },
    })));
  });

  it('keeps save disabled until all reflection fields are complete', () => {
    const { getByText } = render(
      <ReflectionForm activityId="breathing" teamId="team-1" questions={['First question', 'Second question']} onSaved={jest.fn()} />,
    );

    expect(getByText('Save Reflection').parent?.props.accessibilityState?.disabled).toBeUndefined();
  });
});
