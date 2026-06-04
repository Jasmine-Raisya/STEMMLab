import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { BatteryWarning } from '../../components/BatteryWarning';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SchoolMap } from '../../components/SchoolMap';
import { SensorLineChart } from '../../components/SensorLineChart';
import { SpeechButton } from '../../components/SpeechButton';
import { useSoundMeter } from '../../hooks/useSoundMeter';
import { useTeam } from '../../services/teamContext';
import { SensorSample } from '../../types/models';

interface Props {
  onBack: () => void;
}

interface SoundActionLog {
  id: string;
  name: string;
  decibel: number;
  min: number;
  max: number;
  location: string;
  timestamp: number;
}

const SvgDefs = Defs as unknown as React.ComponentType<{ children: React.ReactNode }>;
const instructionImage = require('../../../assets/exp2.jpg');

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function InstructionScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const equipment = translatedArray(t('sound.equipment', { returnObjects: true }));
  const instructions = translatedArray(t('sound.instructions', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('sound.title')}</Text>
      <SpeechButton text={[t('sound.overview'), ...equipment, ...instructions]} style={s.speech} />
      <Image source={instructionImage} resizeMode="contain" style={s.diagramImage} />
      <View style={s.infoBox}>
        <Text style={s.body}>The actions in the diagram are examples only. You can use any safe classroom object or action to make noise.</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('parachute.overview')}</Text>
        <Text style={s.body}>{t('sound.overview')}</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('sound.equipmentTitle')}</Text>
        <BulletList items={equipment} />
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('sound.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('sound.begin')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DecibelMeterScreen({ logs, onAddLog, onNext }: { logs: SoundActionLog[]; onAddLog: (log: SoundActionLog) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const meter = useSoundMeter();
  const [actionName, setActionName] = useState('');
  const db = meter.decibel;
  const pct = Math.min(100, (db / 100) * 100);
  const angle = -90 + (pct / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = 100 + 80 * Math.cos(rad);
  const needleY = 90 + 80 * Math.sin(rad);
  const color = db < 45 ? '#4CAF50' : db < 75 ? '#FFC107' : '#F44336';
  const trimmedActionName = actionName.trim();
  const meterStatus = meter.error
    ?? (meter.recording
      ? (meter.meteringAvailable ? 'Microphone is recording live sound levels.' : 'Microphone is recording, but this device has not returned live metering yet.')
      : 'Press Start and allow microphone access to begin measuring.');

  const handleAddLog = () => {
    if (!trimmedActionName) return;
    const recentValues = meter.samples.slice(-10).map((sample) => sample.value);
    const values = recentValues.length > 0 ? recentValues : [db];
    onAddLog({
      id: `${Date.now()}-${trimmedActionName}`,
      name: trimmedActionName,
      decibel: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      location: 'Unmapped',
      timestamp: Date.now(),
    });
    setActionName('');
  };

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('sound.meter')}</Text>
      <Text style={[s.muted, { marginBottom: 12 }]}>Use the large decibel value and graph to compare each action clearly.</Text>
      <SpeechButton text={t('sound.meterSub')} style={s.speech} />
      <BatteryWarning />
      <View style={s.meterCard}>
        <Svg width="100%" height={128} viewBox="0 0 200 110">
          <SvgDefs>
            <LinearGradient id="soundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4CAF50" />
              <Stop offset="50%" stopColor="#FFC107" />
              <Stop offset="100%" stopColor="#F44336" />
            </LinearGradient>
          </SvgDefs>
          <Path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="#e0e0e0" strokeWidth="20" strokeLinecap="round" />
          <Path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="url(#soundGradient)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${pct * 2.51} 1000`} />
          <Line x1="100" y1="90" x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="100" cy="90" r="8" fill={color} />
        </Svg>
        <Text style={[s.dbValue, { color }]}>{db}</Text>
        <Text style={s.dbUnit}>dB</Text>
      </View>
      <SensorLineChart samples={meter.samples} label="Calibrated decibel graph" color="#0074D9" />
      <View style={s.logPanel}>
        <Text style={s.label}>{t('sound.actionName')}</Text>
        <TextInput onChangeText={setActionName} placeholder={t('sound.actionNamePlaceholder')} style={s.input} value={actionName} />
        <TouchableOpacity disabled={!trimmedActionName} style={[s.outlineBtn, !trimmedActionName && s.disabled]} onPress={handleAddLog}>
          <Text style={s.outlineBtnText}>{t('sound.addActionRecord')}</Text>
        </TouchableOpacity>
        {logs.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.logPreviewStrip}>
            {logs.map((log) => (
              <View key={log.id} style={s.logPreviewCard}>
                <Text style={s.cardTitle} numberOfLines={1}>{log.name}</Text>
                <Text style={s.muted}>{log.decibel} dB</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: meter.recording ? '#C53A2C' : stemmColors.green }]} onPress={meter.recording ? meter.stop : meter.start}>
        <Text style={s.btnText}>{meter.recording ? t('common.stop') : t('common.start')}</Text>
      </TouchableOpacity>
      <Text style={[s.meterStatus, meter.error && s.meterError]}>{meterStatus}</Text>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Map Logged Actions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ActionMapScreen({ logs, onAssignLocation, onNext }: { logs: SoundActionLog[]; onAssignLocation: (id: string, location: string) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const locations = translatedArray(t('sound.locations', { returnObjects: true }));
  const geoSamples: SensorSample[] = logs.map((log, index) => ({
    activityId: 'sound',
    metric: log.name,
    value: log.decibel,
    latitude: -6.2 + index * 0.0008,
    longitude: 106.8 + index * 0.0008,
    timestamp: log.timestamp,
  }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>Action Logger and Location Tagger</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>Assign each logged action to a map pin to identify quiet and loud classroom areas.</Text>
      <View style={s.mapBox}>
        {logs.length > 0 ? <SchoolMap samples={geoSamples} /> : <Text style={s.mapText}>MAP</Text>}
      </View>
      {logs.length === 0 ? (
        <View style={s.infoBox}>
          <Text style={s.body}>{t('sound.noActionLogs')}</Text>
        </View>
      ) : (
        logs.map((log, index) => (
          <View key={log.id} style={s.actionMapCard}>
            <View style={s.actionCardHeader}>
              <Text style={s.actionInitial}>{index + 1}</Text>
              <View style={s.flex}>
                <Text style={s.cardTitle}>{log.name}</Text>
                <Text style={s.muted}>{log.decibel} dB | {t('sound.dbRange')}: {log.min}-{log.max} dB</Text>
              </View>
            </View>
            <Text style={s.label}>Location pin: {log.location}</Text>
            <View style={s.locationChips}>
              {locations.map((location) => (
                <TouchableOpacity key={location} style={[s.locationChip, log.location === location && s.locationChipActive]} onPress={() => onAssignLocation(log.id, location)}>
                  <Text style={[s.locationChipText, log.location === location && s.locationChipTextActive]}>{location}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))
      )}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('sound.viewRiskChart')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function RiskChartScreen({ logs, onNext }: { logs: SoundActionLog[]; onNext: () => void }) {
  const { t } = useTranslation();
  const levels = [
    { range: '0-45 dB', color: '#4CAF50', label: 'Quiet/safe' },
    { range: '45-75 dB', color: '#FFC107', label: 'Moderate' },
    { range: '75+ dB', color: '#F44336', label: 'Loud' },
  ];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('sound.riskChart')}</Text>
      <Text style={[s.muted, { marginBottom: 20 }]}>Use your logged actions to decide where the classroom was quietest and loudest.</Text>
      <View style={s.chartContainer}>
        {logs.length === 0 ? <Text style={s.body}>{t('sound.noActionLogs')}</Text> : logs.map((log) => (
          <View key={log.id} style={s.riskRow}>
            <Text style={[s.cardTitle, s.flex]}>{log.name}</Text>
            <View style={[s.riskBar, { width: `${Math.min(100, log.decibel)}%`, backgroundColor: log.decibel < 45 ? '#4CAF50' : log.decibel < 75 ? '#FFC107' : '#F44336' }]} />
            <Text style={s.scoreText}>{log.decibel} dB</Text>
          </View>
        ))}
      </View>
      {levels.map((level) => (
        <View key={level.range} style={s.legendRow}>
          <View style={[s.legendBlock, { backgroundColor: level.color }]} />
          <View style={s.flex}>
            <Text style={s.cardTitle}>{level.label}</Text>
            <Text style={s.muted}>{level.range}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={[s.btn, { marginTop: 16 }]} onPress={onNext}>
        <Text style={s.btnText}>{t('common.writeSummary')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ logs, onBack }: { logs: SoundActionLog[]; onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const fields = translatedArray(t('sound.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.writeUp')}</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>{t('sound.writeSub')}</Text>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Action evidence</Text>
        {logs.length === 0 ? <Text style={s.body}>{t('sound.noActionLogs')}</Text> : logs.map((log) => (
          <Text key={log.id} style={s.body}>{log.name}: {log.decibel} dB at {log.location}</Text>
        ))}
      </View>
      <SpeechButton text={fields} style={s.speech} />
      <ReflectionForm activityId="sound" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function SoundPollutionActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [actionLogs, setActionLogs] = useState<SoundActionLog[]>([]);
  const total = 5;

  const addActionLog = (log: SoundActionLog) => {
    setActionLogs((previous) => [log, ...previous]);
  };

  const assignLocation = (id: string, location: string) => {
    setActionLogs((previous) => previous.map((log) => log.id === id ? { ...log, location } : log));
  };

  return (
    <View style={s.root}>
      <ActivityHeader title={t('sound.title')} step={step} total={total} color="#0074D9" onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <InstructionScreen onNext={() => setStep(2)} />}
        {step === 2 && <DecibelMeterScreen logs={actionLogs} onAddLog={addActionLog} onNext={() => setStep(3)} />}
        {step === 3 && <ActionMapScreen logs={actionLogs} onAssignLocation={assignLocation} onNext={() => setStep(4)} />}
        {step === 4 && <RiskChartScreen logs={actionLogs} onNext={() => setStep(5)} />}
        {step === 5 && <WriteUpScreen logs={actionLogs} onBack={onBack} />}
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
  muted: { color: stemmColors.muted, fontSize: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  section: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  btn: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  outlineBtn: { alignItems: 'center', borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, justifyContent: 'center', minHeight: 50, paddingHorizontal: 16, paddingVertical: 12 },
  outlineBtnText: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  diagramImage: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, height: 250, marginBottom: 16, width: '100%' },
  infoBox: { backgroundColor: '#EBF5FF', borderRadius: 14, marginBottom: 14, padding: 14 },
  meterCard: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: stemmColors.border, borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 14 },
  dbValue: { fontSize: 58, fontWeight: '900', marginTop: 0 },
  dbUnit: { color: stemmColors.muted, fontSize: 18, fontWeight: '800' },
  meterStatus: { color: stemmColors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 12, textAlign: 'center' },
  meterError: { color: '#C53A2C' },
  input: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, color: stemmColors.text, fontSize: 16, marginBottom: 10, paddingHorizontal: 14, paddingVertical: 12 },
  logPanel: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 14 },
  logPreviewStrip: { marginTop: 12 },
  logPreviewCard: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, marginRight: 10, minWidth: 116, padding: 12 },
  mapBox: { alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 16, height: 180, justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
  mapText: { color: '#0074D9', fontSize: 32, fontWeight: '900', opacity: 0.42 },
  actionMapCard: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14 },
  actionCardHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionInitial: { color: '#0074D9', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  scoreText: { color: stemmColors.blue, fontSize: 18, fontWeight: '900', marginLeft: 8 },
  locationChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  locationChip: { borderColor: stemmColors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  locationChipActive: { backgroundColor: stemmColors.blue, borderColor: stemmColors.blue },
  locationChipText: { color: stemmColors.text, fontSize: 12, fontWeight: '800' },
  locationChipTextActive: { color: '#fff' },
  chartContainer: { borderColor: '#e5e7eb', borderRadius: 16, borderWidth: 1, marginBottom: 16, padding: 16 },
  riskRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 12 },
  riskBar: { borderRadius: 6, height: 12, maxWidth: 110, minWidth: 12 },
  legendRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 10 },
  legendBlock: { borderRadius: 4, height: 22, width: 22 },
});
