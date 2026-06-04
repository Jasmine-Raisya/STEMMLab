import { useMemo, useState } from 'react';

import { insertActivityReflection } from '../services/localDb';
import { syncPendingLocalData } from '../services/syncService';
import { ActivityId } from '../types/models';

export function useActivityReflection(activityId: ActivityId, teamId: string, questions: string[]) {
  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(questions.map((question) => [question, ''])),
  );

  const updateAnswer = (question: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [question]: value }));
  };

  const isValid = rating > 0 && questions.every((question) => answers[question]?.trim().length > 0);

  const save = async () => {
    if (!isValid) throw new Error('Please complete every reflection answer and rating.');
    await insertActivityReflection({
      activityId,
      teamId,
      rating,
      answers,
      timestamp: Date.now(),
    });
    try {
      await syncPendingLocalData();
    } catch (error) {
      console.warn('Reflection saved locally, but Firestore sync failed.', error);
    }
  };

  return useMemo(() => ({ rating, setRating, answers, updateAnswer, isValid, save }), [answers, isValid, rating]);
}
