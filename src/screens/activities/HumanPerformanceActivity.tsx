import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { BatteryWarning } from '../../components/BatteryWarning';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SensorLineChart } from '../../components/SensorLineChart';
import { SpeechButton } from '../../components/SpeechButton';
import { useGyroscopeStream } from '../../hooks/useGyroscopeStream';
import { useTeam } from '../../services/teamContext';
import { SensorSample } from '../../types/models';
import { useThemeColors } from '../../ThemeContext';

interface Props {
  onBack: () => void;
}

type Phase = 'overview' | 'guide' | 'prep' | 'measure' | 'summary' | 'writeup';

interface MovementResult {
  key: string;
  name: string;
  average: number;
  max: number;
  score: number;
}

const movements = [
  {
    key: 'movement1',
    name: 'Movement 1',
    instruction: 'Follow the first posture shown. Move smoothly and keep the phone secured.',
    image: require('../../../assets/exp5.1.jpg'),
  },
  {
    key: 'movement2',
    name: 'Movement 2',
    instruction: 'Follow the second posture shown. Keep the motion controlled for the full timer.',
    image: require('../../../assets/exp5.2.jpg'),
  },
  {
    key: 'movement3',
    name: 'Movement 3',
    instruction: 'Follow the third posture shown. Avoid sudden jerks unless the movement requires it.',
    image: require('../../../assets/exp5.3.jpg'),
  },
];

const overviewImage = require('../../../assets/exp5.jpg');

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function scoreSamples(samples: SensorSample[]) {
  if (samples.length === 0) return { average: 0, max: 0, score: 0 };
  const values = samples.map((sample) => sample.value);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const max = Math.max(...values);
  const score = Math.max(0, Math.min(100, Math.round(100 - average * 25)));
  return { average, max, score };
}

function resultReflectionFields(results: MovementResult[]) {
  if (results.length === 0) return ['Which movement felt hardest to control, and why?'];
  return results.map((result) => (
    `For ${result.name}, explain what the rotation control score (${result.score}/100), average rotation (${result.average.toFixed(2)}), and max rotation (${result.max.toFixed(2)}) show about movement control.`
  ));
}

export function HumanPerformanceActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { team } = useTeam();
  const [phase, setPhase] = useState<Phase>('overview');
  const [movementIndex, setMovementIndex] = useState(0);
  const [prepLeft, setPrepLeft] = useState(5);
  const [measureLeft, setMeasureLeft] = useState(30);
  const [results, setResults] = useState<MovementResult[]>([]);
  const activeMovement = movements[movementIndex];
  const stream = useGyroscopeStream('humanPerformance', phase === 'measure');
  const samplesRef = useRef<SensorSample[]>([]);
  const fields = translatedArray(t('humanPerformance.writeUpFields', { returnObjects: true }));
  const leaderboard = useMemo(() => [...results].sort((a, b) => b.score - a.score), [results]);
  const total = movements.length * 3 + 2;
  const step = phase === 'overview'
    ? 1
    : phase === 'summary'
      ? total - 1
      : phase === 'writeup'
        ? total
        : Math.min(total - 2, movementIndex * 3 + (phase === 'guide' ? 2 : phase === 'prep' ? 3 : 4));

  useEffect(() => {
    samplesRef.current = stream.samples;
  }, [stream.samples]);

  useEffect(() => {
    if (phase !== 'prep') return undefined;
    const timer = setInterval(() => {
      setPrepLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          samplesRef.current = [];
          setMeasureLeft(30);
          setPhase('measure');
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'measure') return undefined;
    const timer = setInterval(() => {
      setMeasureLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          finishMeasurement();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, movementIndex]);

  const startMovement = () => {
    setPrepLeft(5);
    setPhase('prep');
  };

  const finishMeasurement = () => {
    const summary = scoreSamples(samplesRef.current);
    const completed = {
      key: activeMovement.key,
      name: activeMovement.name,
      ...summary,
    };
    setResults((previous) => [...previous.filter((item) => item.key !== completed.key), completed]);
    if (movementIndex < movements.length - 1) {
      setMovementIndex((index) => index + 1);
      setPrepLeft(5);
      setMeasureLeft(30);
      setPhase('guide');
    } else {
      setPhase('summary');
    }
  };

  const skipMovement = () => {
    samplesRef.current = [];
    setPrepLeft(5);
    setMeasureLeft(30);
    if (movementIndex < movements.length - 1) {
      setMovementIndex((index) => index + 1);
      setPhase('guide');
    } else {
      setPhase('summary');
    }
  };

  const goBack = () => {
    if (phase === 'overview') return onBack();
    if (phase === 'summary') {
      setMovementIndex(movements.length - 1);
      setPhase('guide');
      return;
    }
    if (phase === 'writeup') {
      setPhase('summary');
      return;
    }
    if (phase === 'prep' || phase === 'measure') {
      samplesRef.current = [];
      setPrepLeft(5);
      setMeasureLeft(30);
      setPhase('guide');
      return;
    }
    if (phase === 'guide' && movementIndex > 0) {
      setMovementIndex((index) => Math.max(0, index - 1));
      setPhase('guide');
      return;
    }
    setPhase('overview');
  };

  const instructions = [
    'Secure the phone before each movement.',
    'Study the movement image first.',
    'Use the 5-second break to get ready.',
    'Move for the full 30 seconds while rotational movement is measured with the gyroscope.',
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ActivityHeader title={t('humanPerformance.title')} step={step} total={total} color={stemmColors.green} onBack={goBack} />

      {phase === 'overview' && (
        <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.heading, { color: colors.heading }]}>{t('humanPerformance.movementMenu')}</Text>
          <Text style={[styles.body, { color: colors.text }]}>{t('humanPerformance.overview')}</Text>
          <SpeechButton text={[t('humanPerformance.overview'), ...instructions]} style={styles.speech} />
          <Image source={overviewImage} style={[styles.overviewImage, { borderColor: colors.border, backgroundColor: colors.surface }]} resizeMode="contain" />
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('humanPerformance.instructionsTitle')}</Text>
            <BulletList items={instructions} />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setPhase('guide')}>
            <Text style={styles.primaryButtonText}>Start Movement 1</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {phase === 'guide' && (
        <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.heading, { color: colors.heading }]}>{activeMovement.name}</Text>
          <Text style={[styles.body, { color: colors.text, marginBottom: 14 }]}>{activeMovement.instruction}</Text>
          <Image source={activeMovement.image} style={[styles.movementImage, { borderColor: colors.border }]} resizeMode="contain" />
          <TouchableOpacity style={styles.primaryButton} onPress={startMovement}>
            <Text style={styles.primaryButtonText}>Start 5 Second Break</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {phase === 'prep' && (
        <View style={[styles.fullTimer, { backgroundColor: colors.background }]}>
          <Text style={[styles.heading, { color: colors.heading }]}>{activeMovement.name}</Text>
          <Text style={[styles.body, { color: colors.text }]}>Get ready</Text>
          <Text style={[styles.countdown, { color: colors.cta }]}>{prepLeft}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>measurement starts after the break</Text>
          <TouchableOpacity style={[styles.skipButton, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={skipMovement}>
            <Text style={[styles.skipButtonText, { color: colors.heading }]}>Skip Movement</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'measure' && (
        <View style={[styles.pad, styles.flex, { backgroundColor: colors.background }]}>
          <Text style={[styles.heading, { color: colors.heading }]}>{activeMovement.name}</Text>
          <Text style={[styles.body, { color: colors.text }]}>Move now. Rotation is being measured with the gyroscope.</Text>
          <View style={styles.center}>
            <Text style={[styles.countdown, { color: colors.cta }]}>{measureLeft}</Text>
            <Text style={[styles.body, { color: colors.muted }]}>seconds</Text>
          </View>
          <BatteryWarning />
          <SensorLineChart samples={stream.samples} label="Gyroscope rotation" color={stemmColors.green} />
          <TouchableOpacity style={[styles.skipButton, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={skipMovement}>
            <Text style={[styles.skipButtonText, { color: colors.heading }]}>Skip Movement</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'summary' && (
        <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.heading, { color: colors.heading }]}>{t('humanPerformance.performanceSummary')}</Text>
          {leaderboard.map((result, index) => (
            <View key={result.key} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.rank, { color: colors.heading }]}>#{index + 1}</Text>
              <View style={styles.flex}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{result.name}</Text>
                <Text style={[styles.muted, { color: colors.muted }]}>Avg rotation {result.average.toFixed(2)} | Max rotation {result.max.toFixed(2)}</Text>
              </View>
              <Text style={styles.statValue}>{result.score}</Text>
            </View>
          ))}
          {results.length === 0 && (
            <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('parachute.noIterations')}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={() => setPhase('writeup')}>
            <Text style={styles.primaryButtonText}>{t('common.writeSummary')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {phase === 'writeup' && (
        <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.heading, { color: colors.heading }]}>{t('humanPerformance.writeUp')}</Text>
          <Text style={[styles.body, { color: colors.text, marginBottom: 14 }]}>{t('humanPerformance.documentFindings')}</Text>
          <SpeechButton text={[...fields, ...resultReflectionFields(results)]} style={styles.speech} />
          <ReflectionForm
            activityId="humanPerformance"
            teamId={team?.id ?? 'local'}
            questions={[...fields, ...resultReflectionFields(results)]}
            results={{ movements: results, leaderboard }}
            onSaved={onBack}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  body: { fontSize: 16, lineHeight: 24 },
  speech: { marginBottom: 16, marginTop: 12 },
  section: { borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: stemmColors.blue,
    borderRadius: 14,
    justifyContent: 'center',
    marginBottom: 8,
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: { color: stemmColors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  overviewImage: { borderRadius: 14, borderWidth: 1, height: 260, marginBottom: 16, marginTop: 14, width: '100%' },
  movementImage: { borderRadius: 14, borderWidth: 1, height: 360, marginBottom: 16, width: '100%' },
  fullTimer: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 20 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  countdown: { fontSize: 86, fontWeight: '900', marginVertical: 18 },
  skipButton: { alignItems: 'center', borderRadius: 14, borderWidth: 1, justifyContent: 'center', marginTop: 16, minHeight: 48, paddingHorizontal: 18, paddingVertical: 12 },
  skipButtonText: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  resultCard: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 10, padding: 14 },
  rank: { fontSize: 22, fontWeight: '900', width: 42 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  muted: { fontSize: 14 },
  statValue: { color: stemmColors.green, fontSize: 24, fontWeight: '900' },
});
