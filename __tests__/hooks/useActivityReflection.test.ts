import { act, renderHook } from '@testing-library/react-native';

import { useActivityReflection } from '../../src/hooks/useActivityReflection';
import { insertActivityReflection } from '../../src/services/localDb';
import { syncPendingLocalData } from '../../src/services/syncService';

jest.mock('../../src/services/localDb', () => ({
  insertActivityReflection: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/syncService', () => ({
  syncPendingLocalData: jest.fn(async () => ({ skipped: false })),
}));

describe('useActivityReflection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts invalid until every answer and rating are completed', () => {
    const { result } = renderHook(() => useActivityReflection('sound', 'team-1', ['Question one']));

    expect(result.current.isValid).toBe(false);
    act(() => result.current.setRating(4));
    act(() => result.current.updateAnswer('Question one', 'My answer'));

    expect(result.current.isValid).toBe(true);
  });

  it('saves completed reflection locally and triggers sync', async () => {
    const { result } = renderHook(() => useActivityReflection('reaction', 'team-1', ['What happened?']));

    act(() => result.current.setRating(5));
    act(() => result.current.updateAnswer('What happened?', 'Reaction improved.'));

    await act(async () => {
      await result.current.save();
    });

    expect(insertActivityReflection).toHaveBeenCalledWith(expect.objectContaining({
      activityId: 'reaction',
      teamId: 'team-1',
      rating: 5,
      answers: { 'What happened?': 'Reaction improved.' },
    }));
    expect(syncPendingLocalData).toHaveBeenCalledTimes(1);
  });

  it('throws when saving incomplete reflection', async () => {
    const { result } = renderHook(() => useActivityReflection('breathing', 'team-1', ['Question']));

    await expect(result.current.save()).rejects.toThrow('Please complete every reflection answer and rating.');
  });
});
