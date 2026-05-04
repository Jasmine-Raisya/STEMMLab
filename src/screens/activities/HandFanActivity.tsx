import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';

interface Props { onBack: () => void; }

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function SetupGuideScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const equipment = translatedArray(t('handFan.equipment', { returnObjects: true }));
  const instructions = translatedArray(t('handFan.instructions', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('handFan.setup')}</Text>
      <SpeechButton text={[t('handFan.overview'), ...equipment, ...instructions]} style={s.speech} />
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('parachute.overview')}</Text>
        <Text style={s.body}>{t('handFan.overview')}</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('handFan.equipmentTitle')}</Text>
        <BulletList items={equipment} />
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('handFan.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('handFan.beginTest')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function AngleToolScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const [angle, setAngle] = useState(45);

  return (
    <View style={[s.pad, s.flex]}>
      <Text style={s.heading}>{t('handFan.angleTool')}</Text>
      <Text style={[s.body, { marginBottom: 20 }]}>{t('handFan.angleSub')}</Text>
      <SpeechButton text={t('handFan.angleSub')} style={s.speech} />
      <View style={s.center}>
        <Text style={s.angle}>{angle}°</Text>
        <View style={s.sliderRow}>
          <TouchableOpacity style={s.roundBtn} onPress={() => setAngle(Math.max(0, angle - 5))}>
            <Text style={s.btnText}>-</Text>
          </TouchableOpacity>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { width: `${(angle / 180) * 100}%` }]} />
          </View>
          <TouchableOpacity style={s.roundBtn} onPress={() => setAngle(Math.min(180, angle + 5))}>
            <Text style={s.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('handFan.saveAngle')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function MatrixInputScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const designs = [t('data.triangleFold'), t('data.accordion'), t('data.simpleWave'), t('data.doubleLayer')];
  const distances = ['15cm', '30cm', '45cm'];
  const data = [[32, 45, 58], [28, 38, 52], [35, 48, 62], [25, 35, 48]];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('handFan.matrixInput')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.matrixSub')}</Text>
      <View style={[s.tableRow, s.tableHead]}>
        <Text style={[s.tableCell, s.tableHeadText, { flex: 2 }]}>{t('handFan.fanDesign')}</Text>
        {distances.map((distance) => <Text key={distance} style={[s.tableCell, s.tableHeadText]}>{distance}</Text>)}
      </View>
      {designs.map((design, index) => (
        <View key={design} style={s.tableRow}>
          <Text style={[s.tableCell, { flex: 2 }]}>{design}</Text>
          {data[index].map((value) => <Text key={value} style={s.tableCell}>{value}°</Text>)}
        </View>
      ))}
      <View style={s.section}>
        <Text style={s.cardTitle}>{t('handFan.bestPerformer')}: {t('data.doubleLayer')}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('handFan.viewMaterials')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StiffnessRefScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const materials = [t('data.cardboard'), t('data.bondPaper'), t('data.tissuePaper'), t('data.craftPaper'), t('data.magazinePage')];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('handFan.stiffness')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.stiffnessSub')}</Text>
      {materials.map((material, index) => (
        <View key={material} style={s.card}>
          <Text style={s.cardTitle}>{material}</Text>
          <Text style={s.body}>K: {(0.3 + index * 0.55).toFixed(1)}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('handFan.takePhoto')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PhotoProofScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={[s.pad, s.flex]}>
      <Text style={s.heading}>{t('handFan.photoProof')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.photoSub')}</Text>
      <View style={s.cameraView}>
        <Text style={s.cameraText}>42°</Text>
      </View>
      <TouchableOpacity style={s.btn}>
        <Text style={s.btnText}>{t('handFan.capturePhoto')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.outlineBtn} onPress={onNext}>
        <Text style={s.outlineBtnText}>{t('common.next')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function LeaderboardScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.leaderboard')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.topPerformers')}</Text>
      {['Alice', 'Bob', 'Charlie', 'David', 'Eve'].map((name, index) => (
        <View key={name} style={s.lbRow}>
          <Text style={s.rank}>{index + 1}.</Text>
          <Text style={[s.cardTitle, s.flex]}>{name}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.body}>{t('data.bendAngle')}</Text>
            <Text style={s.score}>{35 + index * 5}°</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.writeUp')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const fields = translatedArray(t('handFan.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.writeUp')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.writeSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      {fields.map((field) => (
        <View key={field} style={s.inputGroup}>
          <Text style={s.label}>{field}</Text>
          <TextInput style={s.textarea} multiline editable={false} textAlignVertical="top" />
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onBack}>
        <Text style={s.btnText}>{t('common.completeActivity')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function HandFanActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const total = 7;

  return (
    <View style={s.root}>
      <ActivityHeader title={t('handFan.title')} step={step} total={total} color="#9C27B0" onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <SetupGuideScreen onNext={() => setStep(2)} />}
        {step === 2 && <AngleToolScreen onNext={() => setStep(3)} />}
        {step === 3 && <MatrixInputScreen onNext={() => setStep(4)} />}
        {step === 4 && <StiffnessRefScreen onNext={() => setStep(5)} />}
        {step === 5 && <PhotoProofScreen onNext={() => setStep(6)} />}
        {step === 6 && <LeaderboardScreen onNext={() => setStep(7)} />}
        {step === 7 && <WriteUpScreen onBack={onBack} />}
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
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  angle: { color: '#9C27B0', fontSize: 64, fontWeight: '900' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: stemmColors.blue, alignItems: 'center', justifyContent: 'center' },
  sliderTrack: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  sliderFill: { height: 10, backgroundColor: '#9C27B0' },
  tableRow: { flexDirection: 'row', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 8 },
  tableHead: { backgroundColor: stemmColors.blue },
  tableHeadText: { color: '#fff', fontWeight: '800' },
  tableCell: { flex: 1, color: stemmColors.text, fontSize: 14, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  cameraView: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 16, flex: 1, justifyContent: 'center', marginBottom: 12, minHeight: 220 },
  cameraText: { color: '#fff', fontSize: 44, fontWeight: '900' },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  rank: { color: stemmColors.blue, fontSize: 20, fontWeight: '900', width: 36 },
  score: { color: '#9C27B0', fontSize: 20, fontWeight: '900' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, backgroundColor: '#f9fafb', color: stemmColors.text, fontSize: 16, minHeight: 80 },
});
