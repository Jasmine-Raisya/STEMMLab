import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { BatteryWarning } from '../../components/BatteryWarning';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SpeechButton } from '../../components/SpeechButton';
import { useThemeColors } from '../../ThemeContext';
import { useAccelerometerStream } from '../../hooks/useAccelerometerStream';
import { useGyroscopeStream } from '../../hooks/useGyroscopeStream';
import { useTeam } from '../../services/teamContext';
import { SensorSample } from '../../types/models';

interface Props {
  onBack: () => void;
}

interface EarthquakeIteration {
  id: string;
  name: string;
  folds: number;
  cups: number;
  peakAcceleration: number;
  averageAcceleration: number;
  movementCm: number;
  turnDegrees: number;
  peakTurnRate: number;
  samples: number;
}

const instructionImage = require('../../../assets/exp4.jpg');

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function summarizeShake(accelSamples: SensorSample[], gyroSamples: SensorSample[]) {
  if (accelSamples.length === 0) {
    return { peakAcceleration: 0, averageAcceleration: 0, peakTurnRate: 0, samples: 0 };
  }
  const values = accelSamples.map((sample) => Math.max(0, sample.value - 1));

  return {
    peakAcceleration: Number(Math.max(...values).toFixed(2)),
    averageAcceleration: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
    peakTurnRate: Number((gyroSamples.length ? Math.max(...gyroSamples.map((sample) => sample.value)) : 0).toFixed(2)),
    samples: accelSamples.length,
  };
}

function BuildModeScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const instructions = translatedArray(t('earthquake.instructions', { returnObjects: true }));

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.buildMode')}</Text>
      <SpeechButton text={[t('earthquake.overview'), ...instructions]} style={s.speech} />
      <Image source={instructionImage} resizeMode="contain" style={s.diagramImage} />
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={s.sectionTitle}>{t('parachute.overview')}</Text>
        <Text style={s.body}>{t('earthquake.overview')}</Text>
      </View>
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={s.sectionTitle}>{t('earthquake.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={s.sectionTitle}>Shake test goal</Text>
        <Text style={s.body}>Place the phone on the testing surface, start recording, then vibrate the surface to mimic an earthquake. The app estimates how far the phone moved and how much it turned during the shake.</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Start Iteration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SeismographScreen({ attempt, onSave }: { attempt: number; onSave: (iteration: EarthquakeIteration) => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [recording, setRecording] = useState(false);
  const [folds, setFolds] = useState('');
  const [cups, setCups] = useState('');
  const [movementCm, setMovementCm] = useState('');
  const [turnDegrees, setTurnDegrees] = useState('');
  const stream = useAccelerometerStream({ activityId: 'earthquake', active: recording, threshold: 2.2 });
  const gyroStream = useGyroscopeStream('earthquake', recording);
  const accelSamplesRef = useRef<SensorSample[]>([]);
  const gyroSamplesRef = useRef<SensorSample[]>([]);

  useEffect(() => {
    accelSamplesRef.current = stream.samples;
  }, [stream.samples]);

  useEffect(() => {
    gyroSamplesRef.current = gyroStream.samples;
  }, [gyroStream.samples]);

  useEffect(() => {
    if (!recording) {
      Vibration.cancel();
      return undefined;
    }

    Vibration.vibrate([0, 180, 80, 260, 120, 140, 70, 320], true);
    return () => Vibration.cancel();
  }, [recording]);

  const foldCount = Number(folds);
  const cupCount = Number(cups);
  const movementValue = Number(movementCm.replace(',', '.'));
  const turnValue = Number(turnDegrees.replace(',', '.'));
  const summary = summarizeShake(accelSamplesRef.current, gyroSamplesRef.current);
  const canSave = Number.isFinite(foldCount) && foldCount > 0
    && Number.isFinite(cupCount) && cupCount > 0
    && Number.isFinite(movementValue) && movementValue >= 0
    && Number.isFinite(turnValue) && turnValue >= 0
    && accelSamplesRef.current.length > 0;

  const saveIteration = () => {
    if (!canSave) return;
    onSave({
      id: `${Date.now()}-${attempt}`,
      name: `${foldCount} folds ${cupCount} cups`,
      folds: foldCount,
      cups: cupCount,
      movementCm: Number(movementValue.toFixed(1)),
      turnDegrees: Number(turnValue.toFixed(1)),
      ...summary,
    });
  };

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>Earthquake Shake Test</Text>
      <Text style={[s.muted, { color: colors.muted }]}>Name the iteration, place the phone on the surface, then vibrate the table/platform to mimic an earthquake.</Text>
      <View style={s.buttonRow}>
        <View style={[s.inputGroup, s.flex]}>
          <Text style={[s.label, { color: colors.heading }]}>Folds</Text>
          <TextInput keyboardType="numeric" onChangeText={(value) => setFolds(value.replace(/[^0-9]/g, ''))} placeholder="4" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={folds} />
        </View>
        <View style={[s.inputGroup, s.flex]}>
          <Text style={[s.label, { color: colors.heading }]}>Paper cups</Text>
          <TextInput keyboardType="numeric" onChangeText={(value) => setCups(value.replace(/[^0-9]/g, ''))} placeholder="6" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={cups} />
        </View>
      </View>
      <View style={s.buttonRow}>
        <View style={[s.inputGroup, s.flex]}>
          <Text style={[s.label, s.alignedInputLabel, { color: colors.heading }]}>Movement distance (cm)</Text>
          <TextInput keyboardType="decimal-pad" onChangeText={(value) => setMovementCm(value.replace(/[^0-9.,]/g, ''))} placeholder="12.5" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={movementCm} />
        </View>
        <View style={[s.inputGroup, s.flex]}>
          <Text style={[s.label, s.alignedInputLabel, { color: colors.heading }]}>Turn angle (degrees)</Text>
          <TextInput keyboardType="decimal-pad" onChangeText={(value) => setTurnDegrees(value.replace(/[^0-9.,]/g, ''))} placeholder="30" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={turnDegrees} />
        </View>
      </View>
      <SpeechButton text="Start recording, shake the surface, stop recording, then save the movement and turn estimate." style={s.speech} />
      <BatteryWarning />
      <View style={[s.readoutGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={s.readoutCard}>
          <Text style={[s.statusLabel, { color: colors.muted }]}>Peak shake</Text>
          <Text style={[s.statusText, { color: colors.text }]}>{summary.peakAcceleration} G above rest</Text>
        </View>
        <View style={s.readoutCard}>
          <Text style={[s.statusLabel, { color: colors.muted }]}>Peak turn rate</Text>
          <Text style={[s.statusText, { color: colors.text }]}>{summary.peakTurnRate} rad/s</Text>
        </View>
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: recording ? '#C53A2C' : stemmColors.green }]} onPress={() => setRecording(!recording)}>
        <Text style={s.btnText}>{recording ? 'Stop Shake Recording' : 'Start Shake Recording'}</Text>
      </TouchableOpacity>
      <View style={[s.status, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.statusLabel, { color: colors.muted }]}>{t('earthquake.recordingStatus')}</Text>
        <Text style={[s.statusText, { color: colors.text }]}>{recording ? 'Recording accelerometer and gyroscope data' : `${stream.samples.length} movement samples, ${gyroStream.samples.length} turn samples captured`}</Text>
        <Text style={[s.muted, { color: colors.muted, marginBottom: 0 }]}>Measure movement distance and turn angle after shaking, then enter them above.</Text>
      </View>
      <TouchableOpacity disabled={!canSave} style={[s.btn, !canSave && s.disabled]} onPress={saveIteration}>
        <Text style={s.btnText}>Save Iteration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PeakDataScreen({ iterations, onCreateNew, onFinish }: { iterations: EarthquakeIteration[]; onCreateNew: () => void; onFinish: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.peakData')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>Results below come from the earthquake shake recording in step 2.</Text>
      {iterations.length === 0 ? (
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={s.body}>No iterations recorded yet.</Text></View>
      ) : iterations.map((iteration) => (
        <View key={iteration.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={s.cardTitle}>{iteration.name}</Text>
          <Text style={s.body}>Measured phone movement: {iteration.movementCm} cm</Text>
          <Text style={s.body}>Measured phone turn: {iteration.turnDegrees} degrees</Text>
          <Text style={s.body}>Peak shake above rest: {iteration.peakAcceleration} G</Text>
          <Text style={s.body}>Average shake above rest: {iteration.averageAcceleration} G</Text>
          <Text style={s.body}>Peak turn rate: {iteration.peakTurnRate} rad/s</Text>
          <Text style={s.body}>Samples: {iteration.samples}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onCreateNew}>
        <Text style={s.btnText}>Create Another Iteration</Text>
      </TouchableOpacity>
      {iterations.length > 0 && (
        <TouchableOpacity style={s.outlineBtn} onPress={onFinish}>
          <Text style={s.outlineBtnText}>{t('common.viewLeaderboard')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function LeaderboardScreen({ iterations, onNext }: { iterations: EarthquakeIteration[]; onNext: () => void }) {
  const { team } = useTeam();
  const colors = useThemeColors();
  const ranked = [...iterations].sort((a, b) => a.movementCm + a.turnDegrees - (b.movementCm + b.turnDegrees));

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{tSafe('Leaderboard')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>Lower movement and lower turn means the structure stayed more stable during the shake.</Text>
      {ranked.length === 0 && <Text style={s.body}>No synced leaderboard entries yet.</Text>}
      {ranked.map((iteration, index) => (
        <View key={iteration.id} style={[s.lbRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={s.rank}>{index + 1}</Text>
          <View style={s.flex}>
            <Text style={s.cardTitle}>{iteration.name}</Text>
            <Text style={s.body}>{team?.teamName ?? 'Local team'}</Text>
          </View>
          <Text style={s.score}>{iteration.movementCm} cm / {iteration.turnDegrees} deg</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Complete Reflection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function tSafe(value: string) {
  return value;
}

function ReflectionScreen({ iterations, onBack }: { iterations: EarthquakeIteration[]; onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const colors = useThemeColors();
  const fields = translatedArray(t('earthquake.writeUpFields', { returnObjects: true }));
  const iterationFields = iterations.map((iteration) => `Explain why ${iteration.name} moved ${iteration.movementCm} cm and turned ${iteration.turnDegrees} degrees during the shake.`);

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.reflection')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('earthquake.reflectionSub')}</Text>
      <SpeechButton text={[...fields, ...iterationFields]} style={s.speech} />
      <ReflectionForm activityId="earthquake" teamId={team?.id ?? 'local'} questions={[...fields, ...iterationFields]} onSaved={onBack} />
    </ScrollView>
  );
}

export function EarthquakeActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [iterations, setIterations] = useState<EarthquakeIteration[]>([]);
  const total = 5;

  const saveIteration = (iteration: EarthquakeIteration) => {
    setIterations((previous) => [iteration, ...previous]);
    setStep(3);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ActivityHeader title={t('earthquake.title')} step={step} total={total} color={stemmColors.green} onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <BuildModeScreen onNext={() => setStep(2)} />}
        {step === 2 && <SeismographScreen attempt={iterations.length + 1} onSave={saveIteration} />}
        {step === 3 && <PeakDataScreen iterations={iterations} onCreateNew={() => setStep(2)} onFinish={() => setStep(4)} />}
        {step === 4 && <LeaderboardScreen iterations={iterations} onNext={() => setStep(5)} />}
        {step === 5 && <ReflectionScreen iterations={iterations} onBack={onBack} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { color: stemmColors.blue, fontSize: 26, fontWeight: '800', marginBottom: 10 },
  speech: { marginBottom: 16 },
  body: { color: stemmColors.text, fontSize: 16, lineHeight: 24 },
  section: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  diagramImage: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, height: 260, marginBottom: 16, width: '100%' },
  btn: { alignItems: 'center', backgroundColor: stemmColors.green, borderRadius: 14, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineBtn: { alignItems: 'center', borderColor: stemmColors.green, borderRadius: 14, borderWidth: 2, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  outlineBtnText: { color: stemmColors.green, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  muted: { fontSize: 16, marginBottom: 16 },
  readoutGrid: { borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 12 },
  readoutCard: { marginBottom: 10 },
  status: { borderRadius: 14, borderWidth: 1, marginBottom: 8, padding: 14 },
  statusLabel: { fontSize: 16, marginBottom: 6 },
  statusText: { fontSize: 16, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  alignedInputLabel: { minHeight: 44 },
  input: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, color: stemmColors.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 },
  disabled: { opacity: 0.45 },
  card: { borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 16 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  lbRow: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  rank: { color: stemmColors.blue, fontSize: 22, fontWeight: '900', width: 32 },
  score: { color: stemmColors.green, fontSize: 18, fontWeight: '900' },
});
