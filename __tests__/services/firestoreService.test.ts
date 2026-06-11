import { getDocs } from 'firebase/firestore';

import { fetchExperimentRecordsForTeam } from '../../src/services/firestoreService';

jest.mock('../../src/services/firebaseConfig', () => ({
  firestore: { type: 'mock-firestore' },
  isFirebaseConfigured: true,
}));

describe('firestoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters legacy raw sensor sample documents from team experiment history', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            id: 'team-1_sensor_sample_earthquake_1',
            teamId: 'team-1',
            activityId: 'earthquake',
            score: 1.8,
            timestamp: 10,
            details: { type: 'sensor_sample' },
          }),
        },
        {
          data: () => ({
            id: 'team-1_reflection_earthquake_2',
            teamId: 'team-1',
            activityId: 'earthquake',
            score: 5,
            timestamp: 20,
            details: { type: 'reflection' },
          }),
        },
      ],
    } as Awaited<ReturnType<typeof getDocs>>);

    await expect(fetchExperimentRecordsForTeam('team-1')).resolves.toEqual([
      expect.objectContaining({
        id: 'team-1_reflection_earthquake_2',
        details: { type: 'reflection' },
      }),
    ]);
  });
});
