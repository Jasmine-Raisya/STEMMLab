import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useActivityReflection } from '../../src/hooks/useActivityReflection';
import { deleteExperimentDraft, getExperimentDraft, saveExperimentDraft } from '../../src/services/localDb';
import { submitFinalExperimentRecord } from '../../src/services/syncService';

jest.mock('../../src/services/localDb', () => ({
  deleteExperimentDraft: jest.fn(async () => undefined),
  getExperimentDraft: jest.fn(async () => null),
  saveExperimentDraft: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/syncService', () => ({
  submitFinalExperimentRecord: jest.fn(async () => ({ skipped: false })),
}));

describe('useActivityReflection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getExperimentDraft).mockResolvedValue(null);
  });

  it('starts invalid until every answer and rating are completed', () => {
    const { result } = renderHook(() => useActivityReflection('sound', 'team-1', ['Question one']));

    expect(result.current.isValid).toBe(false);
    act(() => result.current.setRating(4));
    act(() => result.current.updateAnswer('Question one', 'My answer'));

    expect(result.current.isValid).toBe(true);
  });

  it('submits a completed final experiment record with results', async () => {
    const { result } = renderHook(() => useActivityReflection('reaction', 'team-1', ['What happened?'], { bestTime: 210 }));

    act(() => result.current.setRating(5));
    act(() => result.current.updateAnswer('What happened?', 'Reaction improved.'));

    await act(async () => {
      await result.current.save();
    });

    expect(submitFinalExperimentRecord).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'reaction',
      teamId: 'team-1',
      rating: 5,
      answers: { 'What happened?': 'Reaction improved.' },
      results: { bestTime: 210 },
    }));
    expect(deleteExperimentDraft).toHaveBeenCalledWith('reaction', 'team-1');
  });

  it('restores and persists in-progress draft input locally without syncing to Firestore', async () => {
    jest.mocked(getExperimentDraft).mockResolvedValueOnce({
      rating: 3,
      answers: { 'What happened?': 'Half done.' },
    });

    const { result } = renderHook(() => useActivityReflection('sound', 'team-1', ['What happened?']));

    await waitFor(() => expect(result.current.rating).toBe(3));
    expect(result.current.answers['What happened?']).toBe('Half done.');

    act(() => result.current.updateAnswer('What happened?', 'Still drafting.'));

    await waitFor(() => expect(saveExperimentDraft).toHaveBeenCalledWith('sound', 'team-1', expect.objectContaining({
      rating: 3,
      answers: { 'What happened?': 'Still drafting.' },
    })));
    expect(submitFinalExperimentRecord).not.toHaveBeenCalled();
  });

  it('throws when saving incomplete reflection', async () => {
    const { result } = renderHook(() => useActivityReflection('breathing', 'team-1', ['Question']));

    await expect(result.current.save()).rejects.toThrow('Please complete every reflection answer and rating.');
  });
});
