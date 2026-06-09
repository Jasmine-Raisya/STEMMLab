import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SpeechButton } from '../../components/SpeechButton';
import { useTeam } from '../../services/teamContext';
import { useThemeColors } from '../../ThemeContext';

interface Props {
  onBack: () => void;
}

interface FanIteration {
  id: string;
  name: string;
  videoUri: string;
  frameUri: string;
  material: string;
  stiffnessK: number;
  bendAngle: number | null;
  angleRadians: number | null;
  force: number | null;
}

const instructionImage = require('../../../assets/exp3.jpg');
const materialOptions = [
  { material: 'Thin printer paper', thickness: '0.1 mm', stiffnessK: 0.05, notes: 'Bends very easily' },
  { material: 'Standard card stock', thickness: '0.25 mm', stiffnessK: 0.2, notes: 'Moderate bend' },
  { material: 'Thin cardboard', thickness: '0.5 mm', stiffnessK: 0.5, notes: 'Much harder to bend' },
  { material: 'Corrugated cardboard', thickness: '3 mm', stiffnessK: 2.5, notes: 'Very stiff, almost no bend' },
];

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function SetupGuideScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const equipment = translatedArray(t('handFan.equipment', { returnObjects: true }));
  const instructions = translatedArray(t('handFan.instructions', { returnObjects: true }));

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('handFan.setup')}</Text>
      <SpeechButton text={[t('handFan.overview'), ...equipment, ...instructions]} style={s.speech} />
      <Image source={instructionImage} resizeMode="contain" style={s.diagramImage} />
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.heading }]}>{t('parachute.overview')}</Text>
        <Text style={[s.body, { color: colors.text }]}>{t('handFan.overview')}</Text>
      </View>
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.heading }]}>{t('handFan.equipmentTitle')}</Text>
        <BulletList items={equipment} />
      </View>
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.heading }]}>{t('handFan.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('handFan.beginTest')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StiffnessMatrixScreen({ onNext }: { onNext: () => void }) {
  const colors = useThemeColors();

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>Stiffness Matrix</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>Use this reference before testing each fan iteration. Stiffer materials should bend less under the same airflow.</Text>
      <View style={[s.table, { borderColor: colors.border }]}>
        <View style={[s.tableRow, s.tableHead]}>
          <Text style={[s.tableCell, s.tableHeadText]}>Material</Text>
          <Text style={[s.tableCell, s.tableHeadText]}>Thickness</Text>
          <Text style={[s.tableCell, s.tableHeadText]}>k (N/rad)</Text>
          <Text style={[s.tableCell, s.tableHeadText]}>Notes</Text>
        </View>
        {materialOptions.map((row) => (
          <View key={row.material} style={s.tableRow}>
            <Text style={[s.tableCell, { color: colors.text }]}>{row.material}</Text>
            <Text style={[s.tableCell, { color: colors.text }]}>{row.thickness}</Text>
            <Text style={[s.tableCell, { color: colors.text }]}>{row.stiffnessK}</Text>
            <Text style={[s.tableCell, { color: colors.text }]}>{row.notes}</Text>
          </View>
        ))}
      </View>
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.heading }]}>Calculation</Text>
        <Text style={[s.body, { color: colors.text }]}>After the bend angle is entered, the app converts degrees to radians and estimates force with F = k x theta.</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Start Iteration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function AngleArch({ angle }: { angle: number }) {
  const width = 300;
  const height = 190;
  const cx = 150;
  const cy = 158;
  const radius = 116;
  const safeAngle = Math.max(0, Math.min(180, Math.round(angle)));
  const rad = (safeAngle * Math.PI) / 180;
  const handLength = radius - 10;
  const handX = cx + handLength * Math.cos(rad);
  const handY = cy - handLength * Math.sin(rad);
  const ticks = [0, 30, 60, 90, 120, 150, 180];

  return (
    <View style={s.archWrap}>
      <Svg height={height} viewBox={`0 0 ${width} ${height}`} width="100%">
        <Path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`} fill="none" stroke={stemmColors.text} strokeWidth={3} />
        <Line stroke={stemmColors.border} strokeWidth={3} x1={cx - radius} x2={cx + radius} y1={cy} y2={cy} />
        {ticks.map((tick) => {
          const tickRad = (tick * Math.PI) / 180;
          const outerX = cx + radius * Math.cos(tickRad);
          const outerY = cy - radius * Math.sin(tickRad);
          const innerX = cx + (radius - 12) * Math.cos(tickRad);
          const innerY = cy - (radius - 12) * Math.sin(tickRad);
          const labelX = cx + (radius - 30) * Math.cos(tickRad);
          const labelY = cy - (radius - 30) * Math.sin(tickRad);
          return (
            <React.Fragment key={tick}>
              <Line stroke={stemmColors.muted} strokeWidth={2} x1={outerX} x2={innerX} y1={outerY} y2={innerY} />
              <SvgText fill={stemmColors.muted} fontSize={11} fontWeight="700" textAnchor="middle" x={labelX} y={labelY + 4}>
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Line stroke="#F5674D" strokeLinecap="round" strokeWidth={8} x1={cx} x2={handX} y1={cy} y2={handY} />
        <Circle cx={cx} cy={cy} fill="#F5674D" r={8} />
      </Svg>
      <Text style={s.archAngle}>{safeAngle} degrees</Text>
    </View>
  );
}

function VideoIterationScreen({ attempt, onSave }: { attempt: number; onSave: (iteration: FanIteration) => void }) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [videoUri, setVideoUri] = useState('');
  const [frameUri, setFrameUri] = useState('');
  const [frameTime, setFrameTime] = useState(0);
  const [material, setMaterial] = useState(materialOptions[0].material);
  const [bendAngle, setBendAngle] = useState('45');
  const player = useVideoPlayer(null);
  const framePlayer = useVideoPlayer(null);
  const parsedAngle = Number(bendAngle.replace(',', '.'));
  const angleValue = Number.isFinite(parsedAngle) ? Math.max(0, Math.min(180, parsedAngle)) : 0;
  const selectedMaterial = materialOptions.find((option) => option.material === material) ?? materialOptions[0];
  const angleRadians = Number(((angleValue * Math.PI) / 180).toFixed(3));
  const estimatedForce = Number((selectedMaterial.stiffnessK * angleRadians).toFixed(3));

  useEffect(() => {
    if (!videoUri) {
      void player.replaceAsync(null);
      return;
    }
    void player.replaceAsync({ uri: videoUri });
  }, [player, videoUri]);

  useEffect(() => {
    if (!frameUri) {
      void framePlayer.replaceAsync(null);
      return;
    }

    void framePlayer.replaceAsync({ uri: frameUri }).then(() => {
      framePlayer.currentTime = frameTime;
      framePlayer.pause();
    });
  }, [framePlayer, frameTime, frameUri]);

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, mediaTypes: ['videos'], quality: 1 });
    if (!result.canceled) {
      setVideoUri(result.assets[0]?.uri ?? '');
      setFrameUri('');
      setFrameTime(0);
    }
  };

  const captureFrame = () => {
    if (!videoUri) return;
    const currentTime = Number.isFinite(player.currentTime) ? player.currentTime : 0;
    setFrameTime(currentTime);
    setFrameUri(videoUri);
  };

  const changeAngle = (delta: number) => {
    setBendAngle(String(Math.max(0, Math.min(180, Math.round(angleValue + delta)))));
  };

  const save = () => {
    onSave({
      id: `${Date.now()}-${attempt}`,
      name: name.trim() || `Iteration ${attempt}`,
      videoUri,
      frameUri,
      material: selectedMaterial.material,
      stiffnessK: selectedMaterial.stiffnessK,
      bendAngle: Number.isFinite(parsedAngle) ? angleValue : null,
      angleRadians: Number.isFinite(parsedAngle) ? angleRadians : null,
      force: Number.isFinite(parsedAngle) ? estimatedForce : null,
    });
    setName('');
    setVideoUri('');
    setFrameUri('');
    setFrameTime(0);
    setMaterial(materialOptions[0].material);
    setBendAngle('45');
  };

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>Fan Iteration {attempt}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 14 }]}>Upload a fan test video, capture a frame, then measure the bend angle from that frame.</Text>
      <View style={s.inputGroup}>
        <Text style={[s.label, { color: colors.heading }]}>Iteration name</Text>
        <TextInput onChangeText={setName} placeholder={`Iteration ${attempt}`} placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={name} />
      </View>
      <View style={s.inputGroup}>
        <Text style={[s.label, { color: colors.heading }]}>Material</Text>
        {materialOptions.map((option) => (
          <TouchableOpacity key={option.material} style={[s.materialOption, { backgroundColor: material === option.material ? colors.cta : colors.surface, borderColor: colors.border }]} onPress={() => setMaterial(option.material)}>
            <Text style={[s.cardTitle, { color: material === option.material ? colors.ctaText : colors.text }]}>{option.material}</Text>
            <Text style={[s.body, { color: material === option.material ? colors.ctaText : colors.muted }]}>{option.thickness} | k = {option.stiffnessK} N/rad | {option.notes}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {videoUri ? (
        <VideoView contentFit="contain" nativeControls player={player as never} style={s.videoPlayer} />
      ) : (
        <View style={[s.videoUploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.uploadTitle, { color: colors.heading }]}>Upload test video</Text>
          <Text style={[s.body, { color: colors.text }]}>Choose a video of the fan bending during airflow.</Text>
        </View>
      )}
      <TouchableOpacity style={[s.outlineBtn, { borderColor: colors.border }]} onPress={pickVideo}>
        <Text style={[s.outlineBtnText, { color: colors.text }]}>{videoUri ? 'Replace Video' : 'Choose Video'}</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={!videoUri} style={[s.btn, !videoUri && s.disabled]} onPress={captureFrame}>
        <Text style={s.btnText}>Screenshot Current Frame</Text>
      </TouchableOpacity>
      {frameUri ? (
        <View style={[s.frameBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.frameLabel, { color: colors.heading }]}>Frame screenshot reference</Text>
          <View style={s.frameStill}>
            <Text style={[s.frameStillText, { color: colors.muted }]}>Captured frame</Text>
            <VideoView contentFit="contain" nativeControls={false} player={framePlayer as never} style={s.frameVideo} />
            <AngleArch angle={angleValue} />
          </View>
          <View style={s.angleControls}>
            <TouchableOpacity style={s.angleButton} onPress={() => changeAngle(-5)}>
              <Text style={s.angleButtonText}>-</Text>
            </TouchableOpacity>
            <View style={s.angleTrack}>
              <View style={[s.angleFill, { width: `${(angleValue / 180) * 100}%` }]} />
            </View>
            <TouchableOpacity style={s.angleButton} onPress={() => changeAngle(5)}>
              <Text style={s.angleButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.frameHelp, { color: colors.muted }]}>Adjust the arch hand until it matches the fan bend in the video above.</Text>
        </View>
      ) : null}
      <View style={s.inputGroup}>
        <Text style={[s.label, { color: colors.heading }]}>Bend angle from screenshot</Text>
        <TextInput keyboardType="decimal-pad" onChangeText={(value) => setBendAngle(value.replace(/[^0-9.,]/g, ''))} placeholder="45" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={bendAngle} />
      </View>
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.heading }]}>Force prediction</Text>
        <Text style={[s.body, { color: colors.text }]}>Material stiffness k: {selectedMaterial.stiffnessK} N/rad</Text>
        <Text style={[s.body, { color: colors.text }]}>Bend angle theta: {angleValue} degrees = {angleRadians} rad</Text>
        <Text style={[s.body, { color: colors.text }]}>Estimated force: F = {selectedMaterial.stiffnessK} x {angleRadians} = {estimatedForce} N</Text>
      </View>
      <TouchableOpacity disabled={!videoUri || !frameUri} style={[s.btn, (!videoUri || !frameUri) && s.disabled]} onPress={save}>
        <Text style={s.btnText}>Save Iteration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function IterationLogScreen({ iterations, onCreateNew, onFinish }: { iterations: FanIteration[]; onCreateNew: () => void; onFinish: () => void }) {
  const colors = useThemeColors();
  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>Iteration Log</Text>
      {iterations.length === 0 ? (
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[s.body, { color: colors.text }]}>No fan iterations recorded yet.</Text></View>
      ) : iterations.map((iteration) => (
        <View key={iteration.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.text }]}>{iteration.name}</Text>
          <Text style={[s.body, { color: colors.text }]}>Material: {iteration.material} | k = {iteration.stiffnessK} N/rad</Text>
          <Text style={[s.body, { color: colors.text }]}>Bend angle: {iteration.bendAngle ?? '-'} degrees</Text>
          <Text style={[s.body, { color: colors.text }]}>Force prediction: {iteration.force ?? '-'} N</Text>
          <Text style={[s.body, { color: colors.text }]}>Video: {iteration.videoUri ? 'attached' : '-'}</Text>
          <Text style={[s.body, { color: colors.text }]}>Screenshot frame: {iteration.frameUri ? 'captured' : '-'}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onCreateNew}>
        <Text style={s.btnText}>Create Another Iteration</Text>
      </TouchableOpacity>
      {iterations.length > 0 && (
        <TouchableOpacity style={[s.outlineBtn, { borderColor: colors.border }]} onPress={onFinish}>
          <Text style={[s.outlineBtnText, { color: colors.text }]}>Finish and Compare</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function LeaderboardScreen({ iterations, onNext }: { iterations: FanIteration[]; onNext: () => void }) {
  const { team } = useTeam();
  const colors = useThemeColors();
  const values = iterations.map((iteration) => iteration.bendAngle).filter((value): value is number => typeof value === 'number');
  const best = [...iterations].filter((iteration) => typeof iteration.bendAngle === 'number').sort((a, b) => (b.bendAngle ?? 0) - (a.bendAngle ?? 0))[0];
  const average = values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : '-';

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>Fan Results</Text>
      <View style={[s.lbRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.rank, { color: colors.heading }]}>1.</Text>
        <View style={s.flex}>
          <Text style={[s.cardTitle, { color: colors.text }]}>{team?.teamName ?? 'Local team'}</Text>
          <Text style={[s.body, { color: colors.text }]}>{iterations.length} attempts | {average} degrees average</Text>
        </View>
        <Text style={s.score}>{best ? `${best.bendAngle} degrees` : '-'}</Text>
      </View>
      {iterations.map((iteration) => (
        <View key={iteration.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.text }]}>{iteration.name}</Text>
          <Text style={[s.body, { color: colors.text }]}>Material: {iteration.material} | k = {iteration.stiffnessK} N/rad</Text>
          <Text style={[s.body, { color: colors.text }]}>Measured bend angle: {iteration.bendAngle ?? '-'} degrees ({iteration.angleRadians ?? '-'} rad)</Text>
          <Text style={[s.body, { color: colors.text }]}>Estimated force: {iteration.force ?? '-'} N</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Write Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ iterations, onBack }: { iterations: FanIteration[]; onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const colors = useThemeColors();
  const baseFields = translatedArray(t('handFan.writeUpFields', { returnObjects: true }));
  const iterationFields = iterations.map((iteration) => `Explain the performance of ${iteration.name} using its measured bend angle and estimated force (${iteration.force ?? '-'} N).`);

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('common.writeUp')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('handFan.writeSub')}</Text>
      <SpeechButton text={[...baseFields, ...iterationFields]} style={s.speech} />
      <ReflectionForm activityId="handFan" teamId={team?.id ?? 'local'} questions={[...baseFields, ...iterationFields]} onSaved={onBack} />
    </ScrollView>
  );
}

export function HandFanActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [iterations, setIterations] = useState<FanIteration[]>([]);
  const total = 6;

  const saveIteration = (iteration: FanIteration) => {
    setIterations((previous) => [iteration, ...previous]);
    setStep(4);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ActivityHeader title={t('handFan.title')} step={step} total={total} color="#9C27B0" onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <SetupGuideScreen onNext={() => setStep(2)} />}
        {step === 2 && <StiffnessMatrixScreen onNext={() => setStep(3)} />}
        {step === 3 && <VideoIterationScreen attempt={iterations.length + 1} onSave={saveIteration} />}
        {step === 4 && <IterationLogScreen iterations={iterations} onCreateNew={() => setStep(3)} onFinish={() => setStep(5)} />}
        {step === 5 && <LeaderboardScreen iterations={iterations} onNext={() => setStep(6)} />}
        {step === 6 && <WriteUpScreen iterations={iterations} onBack={onBack} />}
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
  btn: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineBtn: { alignItems: 'center', borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  outlineBtnText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  diagramImage: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, height: 250, marginBottom: 16, width: '100%' },
  table: { borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  tableRow: { borderBottomWidth: 1, borderColor: stemmColors.border, flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 12 },
  tableHead: { backgroundColor: stemmColors.blue },
  tableHeadText: { color: '#fff', fontWeight: '800' },
  tableCell: { color: stemmColors.text, flex: 1, fontSize: 14, textAlign: 'center' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  input: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, color: stemmColors.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 },
  materialOption: { borderRadius: 12, borderWidth: 1, marginBottom: 8, padding: 12 },
  videoPlayer: { aspectRatio: 16 / 9, backgroundColor: '#102031', borderRadius: 14, marginBottom: 14, overflow: 'hidden', width: '100%' },
  videoUploadCard: { alignItems: 'center', aspectRatio: 16 / 9, backgroundColor: '#EAF4F8', borderColor: stemmColors.blue, borderRadius: 14, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', marginBottom: 14, padding: 18 },
  uploadTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  frameBox: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 12 },
  frameLabel: { color: stemmColors.blue, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  frameStill: { alignItems: 'center', backgroundColor: '#F2E7DF', borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, marginBottom: 12, minHeight: 230, overflow: 'hidden', padding: 12 },
  frameStillText: { alignSelf: 'flex-start', color: stemmColors.muted, fontSize: 13, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  frameVideo: { aspectRatio: 16 / 9, backgroundColor: '#102031', borderRadius: 10, marginBottom: 10, width: '100%' },
  archWrap: { alignItems: 'center', width: '100%' },
  archAngle: { color: '#F5674D', fontSize: 22, fontWeight: '900', marginTop: -8 },
  angleControls: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 8 },
  angleButton: { alignItems: 'center', backgroundColor: '#343133', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  angleButtonText: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 28 },
  angleTrack: { backgroundColor: '#D9D0C8', borderRadius: 999, flex: 1, height: 10, overflow: 'hidden' },
  angleFill: { backgroundColor: '#F5674D', borderRadius: 999, height: '100%' },
  frameHelp: { color: stemmColors.muted, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  card: { borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 16 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  lbRow: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, marginBottom: 8, padding: 14 },
  lbFirst: { backgroundColor: stemmColors.greenSoft, borderColor: stemmColors.green, borderWidth: 2 },
  rank: { color: stemmColors.blue, fontSize: 20, fontWeight: '900', width: 36 },
  score: { color: '#9C27B0', fontSize: 18, fontWeight: '900' },
});
