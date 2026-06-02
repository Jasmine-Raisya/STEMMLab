import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { BatteryWarning } from '../../components/BatteryWarning';
import { SensorLineChart } from '../../components/SensorLineChart';
import { useAccelerometerStream } from '../../hooks/useAccelerometerStream';
import { ReflectionForm } from '../../components/ReflectionForm';
import { useTeam } from '../../services/teamContext';

interface Props { onBack: () => void; }

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function PlacementGuideScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const instructions = translatedArray(t('breathing.instructions', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('breathing.placementGuide')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('breathing.placementSub')}</Text>
      <SpeechButton text={[t('breathing.overview'), ...instructions]} style={s.speech} />
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('parachute.overview')}</Text>
        <Text style={s.body}>{t('breathing.overview')}</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('breathing.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('breathing.startResting')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function RestingPulseScreen({ onNext }: { onNext: (breaths: number) => void }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBreathRef = useRef(0);
  const stream = useAccelerometerStream({ activityId: 'breathing', metric: 'resting-chest-motion', active: running, threshold: 2 });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, timeLeft]);

  useEffect(() => {
    if (!running || stream.samples.length === 0) return;
    const latest = stream.samples[stream.samples.length - 1];
    const now = Date.now();
    if (latest.value > 1.05 && now - lastBreathRef.current > 2500) {
      lastBreathRef.current = now;
      setBreathCount((count) => count + 1);
    }
  }, [running, stream.samples]);

  return (
    <View style={[s.pad, s.flex]}>
      <Text style={s.heading}>{t('breathing.restingPulse')}</Text>
      <Text style={[s.body, { marginBottom: 20 }]}>{t('breathing.restingSub')}</Text>
      <SpeechButton text={t('breathing.restingSub')} style={s.speech} />
      <View style={s.center}>
        <Animated.View style={[s.lungsCircle, { transform: [{ scale: pulse }] }]}>
          <Text style={s.lungsText}>AIR</Text>
        </Animated.View>
        <Text style={s.timer}>{timeLeft}</Text>
        <Text style={s.body}>{t('breathing.secondsRemaining')}</Text>
        <View style={s.breathCard}>
          <Text style={s.cardTitle}>{t('breathing.breathsDetected')}</Text>
          <Text style={s.score}>{breathCount}</Text>
        </View>
        <BatteryWarning />
        <SensorLineChart samples={stream.samples} label={t('data.restingState')} color={stemmColors.blue} />
        <TouchableOpacity style={[s.btn, { backgroundColor: running ? '#C53A2C' : stemmColors.green }]} onPress={() => setRunning(!running)}>
          <Text style={s.btnText}>{running ? t('breathing.stopMeasurement') : t('breathing.startMeasurement')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={s.outlineBtn} onPress={() => onNext(breathCount)}>
        <Text style={s.outlineBtnText}>{t('breathing.nextExercise')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ExerciseTimerScreen({ onNext }: { onNext: (jumps: number) => void }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive] = useState(false);
  const [jumpCount, setJumpCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastJumpRef = useRef(0);
  const stream = useAccelerometerStream({ activityId: 'breathing', metric: 'exercise-motion', active, threshold: 4 });

  useEffect(() => {
    if (active && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, timeLeft]);

  useEffect(() => {
    if (!active || stream.samples.length === 0) return;
    const latest = stream.samples[stream.samples.length - 1];
    const now = Date.now();
    if (latest.value > 1.8 && now - lastJumpRef.current > 650) {
      lastJumpRef.current = now;
      setJumpCount((count) => count + 1);
    }
  }, [active, stream.samples]);

  return (
    <View style={[s.pad, s.flex, { backgroundColor: '#FFF8E1' }]}>
      <Text style={s.heading}>{t('breathing.exerciseTimer')}</Text>
      <Text style={[s.body, { marginBottom: 20 }]}>{t('breathing.exerciseSub')}</Text>
      <View style={s.center}>
        <Text style={[s.timer, { color: stemmColors.orange }]}>{timeLeft}</Text>
        <Text style={s.body}>{t('breathing.seconds')}</Text>
        <View style={[s.breathCard, { borderColor: stemmColors.orange }]}>
          <Text style={s.cardTitle}>{t('breathing.starJumps')}</Text>
          <Text style={[s.score, { color: stemmColors.orange }]}>{jumpCount}</Text>
        </View>
        <BatteryWarning />
        <SensorLineChart samples={stream.samples} label={t('data.postExercise')} color={stemmColors.orange} />
        <TouchableOpacity style={[s.btn, { backgroundColor: active ? '#C53A2C' : stemmColors.orange }]} onPress={() => setActive(!active)}>
          <Text style={s.btnText}>{active ? t('breathing.stopExercise') : t('breathing.startJumping')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={s.btn} onPress={() => onNext(jumpCount)}>
        <Text style={s.btnText}>{t('breathing.compareResults')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ComparativeWaveformsScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const stream = useAccelerometerStream({ activityId: 'breathing', metric: 'chest-motion', active: true, threshold: 3 });

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('breathing.waveforms')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('breathing.waveformsSub')}</Text>
      <BatteryWarning />
      <SensorLineChart samples={stream.samples} label={t('data.postExercise')} color={stemmColors.orange} />
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.leaderboard')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LeaderboardScreen({ restingBreaths, exerciseJumps, onNext }: { restingBreaths: number; exerciseJumps: number; onNext: () => void }) {
  const { t } = useTranslation();
  const fields = [
    `${t('data.breathsPerMinuteResting')}: ${restingBreaths}`,
    `${t('breathing.starJumps')}: ${exerciseJumps}`,
    `${t('data.breathsPerMinutePostExercise')}: ${exerciseJumps > 0 ? t('common.recording') : '-'}`,
  ];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.leaderboard')}</Text>
      {fields.map((field) => <View key={field} style={s.card}><Text style={s.cardTitle}>{field}</Text></View>)}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('breathing.medicalReflection')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MedicalReflectionScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const fields = translatedArray(t('breathing.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('breathing.medicalReflection')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('breathing.medicalSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      <ReflectionForm activityId="breathing" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function BreathingPaceActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [restingBreaths, setRestingBreaths] = useState(0);
  const [exerciseJumps, setExerciseJumps] = useState(0);
  const total = 6;

  return (
    <View style={[s.root, step === 3 && { backgroundColor: '#FFF8E1' }]}>
      <ActivityHeader title={t('breathing.title')} step={step} total={total} color={stemmColors.orange} onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <PlacementGuideScreen onNext={() => setStep(2)} />}
        {step === 2 && <RestingPulseScreen onNext={(breaths) => { setRestingBreaths(breaths); setStep(3); }} />}
        {step === 3 && <ExerciseTimerScreen onNext={(jumps) => { setExerciseJumps(jumps); setStep(4); }} />}
        {step === 4 && <ComparativeWaveformsScreen onNext={() => setStep(5)} />}
        {step === 5 && <LeaderboardScreen restingBreaths={restingBreaths} exerciseJumps={exerciseJumps} onNext={() => setStep(6)} />}
        {step === 6 && <MedicalReflectionScreen onBack={onBack} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', color: stemmColors.blue, marginBottom: 10 },
  speech: { marginBottom: 16 },
  body: { color: stemmColors.text, fontSize: 16, lineHeight: 24 },
  section: { backgroundColor: stemmColors.surface, borderRadius: 14, borderWidth: 1, borderColor: stemmColors.border, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  btn: { backgroundColor: stemmColors.blue, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  outlineBtn: { borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 8 },
  outlineBtnText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lungsCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  lungsText: { color: '#0074D9', fontSize: 22, fontWeight: '900' },
  timer: { fontSize: 64, color: '#0074D9', fontWeight: '900', marginTop: 20 },
  breathCard: { width: '100%', alignItems: 'center', borderWidth: 2, borderColor: '#0074D9', borderRadius: 16, padding: 20, marginBottom: 20 },
  card: { borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  score: { fontSize: 38, color: '#0074D9', fontWeight: '900' },
  waveCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 14, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, backgroundColor: '#f9fafb', color: stemmColors.text, fontSize: 16, minHeight: 80 },
});
