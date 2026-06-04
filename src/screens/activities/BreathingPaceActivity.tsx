import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { BatteryWarning } from '../../components/BatteryWarning';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SensorLineChart } from '../../components/SensorLineChart';
import { SpeechButton } from '../../components/SpeechButton';
import { useAccelerometerStream } from '../../hooks/useAccelerometerStream';
import { useTeam } from '../../services/teamContext';
import { useThemeColors } from '../../ThemeContext';

interface Props {
  onBack: () => void;
}

type BreathKey = 'rest' | 'jogging' | 'starJumps';

interface BreathAction {
  key: BreathKey;
  label: string;
}

const positionImage = require('../../../assets/exp7.jpg');

const actions: BreathAction[] = [
  { key: 'rest', label: 'Breathing at rest' },
  { key: 'jogging', label: 'After exercise 1 (jogging)' },
  { key: 'starJumps', label: 'After exercise 2 (star jumps)' },
];

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function PredictionScreen({ predictions, onChange, onNext }: { predictions: Record<BreathKey, string>; onChange: (key: BreathKey, value: string) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const instructions = [
    'Use the breathing position shown in the guide image.',
    'Keep the phone secure and stay as still as possible while recording.',
    'Predict your breathing pace before each measurement.',
    'Record for 60 seconds at rest and after each exercise.',
  ];

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('breathing.placementGuide')}</Text>
      <Text style={[styles.body, { color: colors.text }]}>Record your breathing in the position shown below, then compare your prediction with the actual breathing pace.</Text>
      <SpeechButton text={instructions} style={styles.speech} />
      <Image source={positionImage} resizeMode="contain" style={[styles.guideImage, { borderColor: colors.border, backgroundColor: colors.surface }]} />
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>Instructions</Text>
        <BulletList items={instructions} />
      </View>
      <View style={[styles.table, { borderColor: colors.border }]}>
        <View style={[styles.tableRow, styles.tableHead, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
          <Text style={[styles.tableHeadText, styles.actionCell, { color: colors.heading }]}>Action</Text>
          <Text style={[styles.tableHeadText, styles.valueCell, { color: colors.heading }]}>Predicted breathing pace</Text>
        </View>
        {actions.map((action) => (
          <View key={action.key} style={[styles.tableRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.tableText, styles.actionCell, { color: colors.text }]}>{action.label}</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => onChange(action.key, value.replace(/[^0-9]/g, ''))}
              placeholder="breaths/min"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.valueCell, { borderColor: colors.border, color: colors.text }]}
              value={predictions[action.key]}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={onNext}>
        <Text style={styles.btnText}>Record Breathing at Rest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function BreathingRecordScreen({ label, onNext }: { label: string; onNext: (breaths: number) => void }) {
  const colors = useThemeColors();
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBreathRef = useRef(0);
  const stream = useAccelerometerStream({ activityId: 'breathing', metric: label, active: running, threshold: 2 });

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((previous) => {
          if (previous <= 1) {
            setRunning(false);
            return 0;
          }
          return previous - 1;
        });
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
      setBreaths((count) => count + 1);
    }
  }, [running, stream.samples]);

  const start = () => {
    setTimeLeft(60);
    setBreaths(0);
    setStarted(true);
    setRunning(true);
  };

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.timerContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{label}</Text>
      <Text style={[styles.body, { color: colors.text }]}>Return to the original breathing position before recording.</Text>
      <Image source={positionImage} resizeMode="contain" style={[styles.timerImage, { borderColor: colors.border, backgroundColor: colors.surface }]} />
      <View style={styles.countdownPanel}>
        <Text style={[styles.fullCountdown, { color: colors.cta }]}>{timeLeft}</Text>
        <Text style={[styles.body, { color: colors.muted }]}>seconds</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: running ? '#C53A2C' : colors.cta }]} onPress={running ? () => setRunning(false) : start}>
          <Text style={styles.btnText}>{running ? 'Stop Recording' : 'Start 60 Second Recording'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stack}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Breaths detected</Text>
          <Text style={styles.score}>{breaths}</Text>
        </View>
        <BatteryWarning />
        {started && <SensorLineChart samples={stream.samples} label="Breathing motion" color={stemmColors.orange} />}
      </View>
      <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.heading }, !started && styles.disabled]} disabled={!started} onPress={() => onNext(breaths)}>
        <Text style={[styles.outlineBtnText, { color: colors.heading }]}>Save and Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function JoggingTimerScreen({ onNext }: { onNext: () => void }) {
  const colors = useThemeColors();
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((previous) => {
          if (previous <= 1) {
            setRunning(false);
            return 0;
          }
          return previous - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, timeLeft]);

  const start = () => {
    setTimeLeft(60);
    setStarted(true);
    setRunning(true);
  };

  return (
    <View style={[styles.pad, styles.flex, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.heading }]}>Exercise 1: Jogging</Text>
      <Text style={[styles.body, { color: colors.text }]}>Jog in place for 60 seconds, then return to the breathing position.</Text>
      <View style={styles.countdownPanel}>
        <Text style={[styles.fullCountdown, { color: colors.cta }]}>{timeLeft}</Text>
        <Text style={[styles.body, { color: colors.muted }]}>seconds</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: running ? '#C53A2C' : colors.cta }]} onPress={running ? () => setRunning(false) : start}>
          <Text style={styles.btnText}>{running ? 'Stop Jogging' : 'Start Jogging'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.heading }, !started && styles.disabled]} disabled={!started} onPress={onNext}>
        <Text style={[styles.outlineBtnText, { color: colors.heading }]}>Record Breathing After Jogging</Text>
      </TouchableOpacity>
    </View>
  );
}

function StarJumpScreen({ onNext }: { onNext: () => void }) {
  const colors = useThemeColors();
  const [completed, setCompleted] = useState(false);

  return (
    <View style={[styles.pad, styles.flex, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.heading }]}>Exercise 2: Star Jumps</Text>
      <Text style={[styles.body, { color: colors.text }]}>Complete 100 star jumps, then return to the breathing position shown in the guide.</Text>
      <View style={[styles.bigTaskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.fullCountdown, { color: colors.cta }]}>100</Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>star jumps</Text>
      </View>
      <TouchableOpacity style={[styles.btn, { backgroundColor: completed ? stemmColors.green : colors.cta }]} onPress={() => setCompleted(true)}>
        <Text style={styles.btnText}>{completed ? 'Completed' : 'Mark 100 Star Jumps Done'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.heading }, !completed && styles.disabled]} disabled={!completed} onPress={onNext}>
        <Text style={[styles.outlineBtnText, { color: colors.heading }]}>Record Breathing After Star Jumps</Text>
      </TouchableOpacity>
    </View>
  );
}

function ComparisonScreen({ predictions, actuals, onNext }: { predictions: Record<BreathKey, string>; actuals: Record<BreathKey, number | null>; onNext: () => void }) {
  const colors = useThemeColors();

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>Compare Breathing Pace</Text>
      <Text style={[styles.body, { color: colors.text, marginBottom: 16 }]}>Compare your predicted breathing pace with the actual breathing pace measured after each action.</Text>
      <View style={[styles.table, { borderColor: colors.border }]}>
        <View style={[styles.tableRow, styles.tableHead, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
          <Text style={[styles.tableHeadText, styles.actionCell, { color: colors.heading }]}>Action</Text>
          <Text style={[styles.tableHeadText, styles.valueCell, { color: colors.heading }]}>Predicted</Text>
          <Text style={[styles.tableHeadText, styles.valueCell, { color: colors.heading }]}>Actual</Text>
        </View>
        {actions.map((action) => (
          <View key={action.key} style={[styles.tableRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.tableText, styles.actionCell, { color: colors.text }]}>{action.label}</Text>
            <Text style={[styles.tableText, styles.valueCell, { color: colors.text }]}>{predictions[action.key] || '-'}</Text>
            <Text style={[styles.tableText, styles.valueCell, { color: colors.text }]}>{actuals[action.key] ?? '-'}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={onNext}>
        <Text style={styles.btnText}>Write Reflection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MedicalReflectionScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { team } = useTeam();
  const fields = translatedArray(t('breathing.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('breathing.medicalReflection')}</Text>
      <Text style={[styles.body, { color: colors.text, marginBottom: 16 }]}>{t('breathing.medicalSub')}</Text>
      <SpeechButton text={fields} style={styles.speech} />
      <ReflectionForm activityId="breathing" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function BreathingPaceActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [predictions, setPredictions] = useState<Record<BreathKey, string>>({ rest: '', jogging: '', starJumps: '' });
  const [actuals, setActuals] = useState<Record<BreathKey, number | null>>({ rest: null, jogging: null, starJumps: null });
  const total = 8;

  const updatePrediction = (key: BreathKey, value: string) => {
    setPredictions((previous) => ({ ...previous, [key]: value }));
  };

  const saveActual = (key: BreathKey, value: number, nextStep: number) => {
    setActuals((previous) => ({ ...previous, [key]: value }));
    setStep(nextStep);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ActivityHeader title={t('breathing.title')} step={step} total={total} color={stemmColors.orange} onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={styles.flex}>
        {step === 1 && <PredictionScreen predictions={predictions} onChange={updatePrediction} onNext={() => setStep(2)} />}
        {step === 2 && <BreathingRecordScreen label="Breathing at rest" onNext={(breaths) => saveActual('rest', breaths, 3)} />}
        {step === 3 && <JoggingTimerScreen onNext={() => setStep(4)} />}
        {step === 4 && <BreathingRecordScreen label="After exercise 1 (jogging)" onNext={(breaths) => saveActual('jogging', breaths, 5)} />}
        {step === 5 && <StarJumpScreen onNext={() => setStep(6)} />}
        {step === 6 && <BreathingRecordScreen label="After exercise 2 (star jumps)" onNext={(breaths) => saveActual('starJumps', breaths, 7)} />}
        {step === 7 && <ComparisonScreen predictions={predictions} actuals={actuals} onNext={() => setStep(8)} />}
        {step === 8 && <MedicalReflectionScreen onBack={onBack} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  timerContent: { flexGrow: 1, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  body: { fontSize: 16, lineHeight: 24 },
  speech: { marginBottom: 16, marginTop: 12 },
  section: { borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  guideImage: { borderRadius: 14, borderWidth: 1, height: 260, marginBottom: 16, width: '100%' },
  timerImage: { borderRadius: 14, borderWidth: 1, height: 180, marginTop: 16, width: '100%' },
  table: { borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  tableRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', minHeight: 62, paddingHorizontal: 10, paddingVertical: 8 },
  tableHead: { minHeight: 50 },
  tableHeadText: { fontSize: 13, fontWeight: '900' },
  tableText: { fontSize: 14, fontWeight: '700' },
  actionCell: { flex: 1.35, paddingRight: 8 },
  valueCell: { flex: 1 },
  input: { borderRadius: 10, borderWidth: 1, fontSize: 15, fontWeight: '800', minHeight: 44, paddingHorizontal: 10 },
  btn: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineBtn: { alignItems: 'center', borderRadius: 14, borderWidth: 2, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  outlineBtnText: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  countdownPanel: { alignItems: 'center', justifyContent: 'center', marginVertical: 20, minHeight: 245 },
  fullCountdown: { fontSize: 104, fontWeight: '900', lineHeight: 114 },
  stack: { gap: 12, marginBottom: 16 },
  metricCard: { alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 20, width: '100%' },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  score: { color: '#0074D9', fontSize: 38, fontWeight: '900' },
  bigTaskCard: { alignItems: 'center', borderRadius: 16, borderWidth: 1, justifyContent: 'center', marginVertical: 24, padding: 28 },
  disabled: { opacity: 0.48 },
});
