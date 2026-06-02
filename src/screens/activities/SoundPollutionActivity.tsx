import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { useTeam } from '../../services/teamContext';
import { saveExperimentRecordLocal } from '../../services/localDb';

interface Props { onBack: () => void; }

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

function DecibelMeterScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const db = 68;
  const pct = (db / 120) * 100;
  const angle = -90 + (pct / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = 100 + 80 * Math.cos(rad);
  const needleY = 90 + 80 * Math.sin(rad);
  const color = db < 40 ? '#4CAF50' : db < 70 ? '#FFC107' : '#F44336';

  return (
    <View style={[s.pad, s.flex]}>
      <Text style={s.heading}>{t('sound.meter')}</Text>
      <Text style={[s.muted, { marginBottom: 24 }]}>{t('sound.meterSub')}</Text>
      <SpeechButton text={t('sound.meterSub')} style={s.speech} />
      <View style={s.center}>
        <Svg width={260} height={140} viewBox="0 0 200 110">
          {/* @ts-ignore */}
          <Defs>
            <LinearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4CAF50" />
              <Stop offset="50%" stopColor="#FFC107" />
              <Stop offset="100%" stopColor="#F44336" />
            </LinearGradient>
          </Defs>
          <Path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="#e0e0e0" strokeWidth="20" strokeLinecap="round" />
          <Path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="url(#g)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${pct * 2.51} 1000`} />
          <Line x1="100" y1="90" x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="100" cy="90" r="8" fill={color} />
        </Svg>
        <Text style={[s.dbValue, { color }]}>{db}</Text>
        <Text style={[s.muted, { fontSize: 18 }]}>dB</Text>
        <View style={s.legend}>
          {[
            ['#4CAF50', t('sound.safe')],
            ['#FFC107', t('sound.caution')],
            ['#F44336', t('sound.danger')],
          ].map(([c, label]) => (
            <View key={label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: c }]} />
              <Text style={s.muted}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('sound.logActions')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ActionLoggerScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const actions = translatedArray(t('sound.actions', { returnObjects: true }));
  const levels = ['65-75 dB', '80-90 dB', '30-40 dB', '70-80 dB', '50-60 dB', '75-85 dB'];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('sound.actionLogger')}</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>{t('sound.actionLoggerSub')}</Text>
      <SpeechButton text={[t('sound.actionLoggerSub'), t('sound.samplesNote')]} style={s.speech} />
      <View style={s.grid}>
        {actions.map((name, index) => (
          <TouchableOpacity key={name} style={s.actionCard} activeOpacity={0.8}>
            <Text style={s.actionInitial}>{name.slice(0, 2)}</Text>
            <Text style={s.cardTitle}>{name}</Text>
            <Text style={s.muted}>{levels[index]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.infoBox}>
        <Text style={s.body}>{t('sound.samplesNote')}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.nextStep')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LocationTaggerScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const locations = translatedArray(t('sound.locations', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('sound.locationTagger')}</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>{t('sound.locationSub')}</Text>
      <View style={s.mapBox}>
        <Text style={s.mapText}>MAP</Text>
      </View>
      {locations.map((name, index) => (
        <View key={name} style={s.locRow}>
          <View style={s.locIcon}><Text style={s.locMarker}>{index + 1}</Text></View>
          <View style={s.flex}>
            <Text style={s.cardTitle}>{name}</Text>
            <Text style={s.muted}>{t('sound.samples', { count: index + 2 })}</Text>
          </View>
          <Text style={s.pin}>•</Text>
        </View>
      ))}
      <TouchableOpacity style={[s.btn, { marginTop: 16 }]} onPress={onNext}>
        <Text style={s.btnText}>{t('sound.viewRiskChart')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function RiskChartScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const labels = translatedArray(t('sound.levels', { returnObjects: true }));
  const levels = [
    { range: '0-30 dB', color: '#4CAF50', height: 20 },
    { range: '30-60 dB', color: '#8BC34A', height: 40 },
    { range: '60-85 dB', color: '#FFC107', height: 65 },
    { range: '85-100 dB', color: '#FF9800', height: 80 },
    { range: '100-120 dB', color: '#F44336', height: 95 },
  ];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('sound.riskChart')}</Text>
      <Text style={[s.muted, { marginBottom: 20 }]}>{t('sound.riskSub')}</Text>
      <SpeechButton text={t('sound.riskSub')} style={s.speech} />
      <View style={s.chartContainer}>
        <View style={s.chartBars}>
          {levels.map((level) => (
            <View key={level.range} style={s.chartColumn}>
              <View style={[s.chartBar, { height: level.height * 1.5, backgroundColor: level.color }]} />
              <Text style={[s.muted, s.rangeText]}>{level.range}</Text>
            </View>
          ))}
        </View>
      </View>
      {levels.map((level, index) => (
        <View key={level.range} style={s.legendRow}>
          <View style={[s.legendBlock, { backgroundColor: level.color }]} />
          <View style={s.flex}>
            <Text style={s.cardTitle}>{labels[index]}</Text>
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

function WriteUpScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const fields = translatedArray(t('sound.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.writeUp')}</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>{t('sound.writeSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      {fields.map((field) => (
        <View key={field} style={s.inputGroup}>
          <Text style={s.label}>{field}</Text>
          <TextInput style={s.textarea} multiline editable={false} textAlignVertical="top" />
        </View>
      ))}
      <TouchableOpacity style={[s.btn, { marginBottom: 32 }]} onPress={onBack}>
        <Text style={s.btnText}>{t('common.completeActivity')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function SoundPollutionActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const [step, setStep] = React.useState(1);
  const total = 6;

  const handleCompleteActivity = () => {
    if (team) {
      try {
        saveExperimentRecordLocal({
          id: `sound_${Date.now()}`,
          teamId: team.teamId,
          activityId: 'sound',
          score: 68,
          timestamp: Date.now(),
          details: {
            location: 'Lab Room 2',
            riskLevel: 'Moderate'
          }
        });
      } catch (e) {
        console.error('Failed to save sound pollution experiment to SQLite:', e);
      }
    }
    onBack();
  };

  return (
    <View style={s.root}>
      <ActivityHeader
        title={t('sound.title')}
        step={step}
        total={total}
        color="#0074D9"
        onBack={step === 1 ? onBack : () => setStep(step - 1)}
      />
      <View style={s.flex}>
        {step === 1 && <InstructionScreen onNext={() => setStep(2)} />}
        {step === 2 && <DecibelMeterScreen onNext={() => setStep(3)} />}
        {step === 3 && <ActionLoggerScreen onNext={() => setStep(4)} />}
        {step === 4 && <LocationTaggerScreen onNext={() => setStep(5)} />}
        {step === 5 && <RiskChartScreen onNext={() => setStep(6)} />}
        {step === 6 && <WriteUpScreen onBack={handleCompleteActivity} />}
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
  muted: { fontSize: 14, color: stemmColors.muted },
  label: { fontSize: 16, color: stemmColors.blue, fontWeight: '800', marginBottom: 8 },
  section: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: stemmColors.blue, marginBottom: 8 },
  btn: { backgroundColor: stemmColors.blue, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dbValue: { fontSize: 58, fontWeight: '900', marginTop: 8 },
  legend: { flexDirection: 'row', gap: 14, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionCard: { width: '47%', borderWidth: 2, borderRadius: 14, borderColor: '#0074D9', padding: 14, alignItems: 'center', backgroundColor: '#fff' },
  actionInitial: { color: '#0074D9', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  infoBox: { backgroundColor: '#EBF5FF', borderRadius: 14, padding: 14, marginBottom: 14 },
  mapBox: { backgroundColor: '#f3f4f6', borderRadius: 16, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  mapText: { color: '#0074D9', fontSize: 32, fontWeight: '900', opacity: 0.42 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, marginBottom: 8 },
  locIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center' },
  locMarker: { color: '#0074D9', fontSize: 18, fontWeight: '900' },
  pin: { color: '#0074D9', fontSize: 28 },
  chartContainer: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, marginBottom: 16 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 4 },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: '80%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  rangeText: { fontSize: 10, textAlign: 'center', marginTop: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  legendBlock: { width: 22, height: 22, borderRadius: 4 },
  inputGroup: { marginBottom: 14 },
  textarea: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, backgroundColor: '#f9fafb', color: '#2F3E46', fontSize: 16, minHeight: 80 },
});
