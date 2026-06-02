import React, { useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { ReflectionForm } from '../../components/ReflectionForm';
import { useTeam } from '../../services/teamContext';

interface Props { onBack: () => void; }

type MatrixData = Record<string, Record<string, string>>;

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function getMatrixNumbers(matrix: MatrixData) {
  return Object.values(matrix)
    .flatMap((row) => Object.values(row))
    .map((value) => Number(value.replace(',', '.')))
    .filter((value) => Number.isFinite(value));
}

function getBestMatrixResult(matrix: MatrixData) {
  let best: { design: string; distance: string; angle: number } | null = null;
  for (const [design, row] of Object.entries(matrix)) {
    for (const [distance, value] of Object.entries(row)) {
      const angle = Number(value.replace(',', '.'));
      if (!Number.isFinite(angle)) continue;
      if (!best || angle > best.angle) best = { design, distance, angle };
    }
  }
  return best;
}

function AngleGuide({ angle, compact = false }: { angle: number; compact?: boolean }) {
  const width = 320;
  const height = compact ? 190 : 210;
  const centerX = 160;
  const centerY = compact ? 142 : 154;
  const radius = compact ? 108 : 124;
  const lineX = centerX + (radius - 22) * Math.cos((angle * Math.PI) / 180);
  const lineY = centerY - (radius - 22) * Math.sin((angle * Math.PI) / 180);
  const ticks = Array.from({ length: 19 }, (_, index) => index * 10);

  return (
    <View style={compact ? s.angleGuideCompact : s.angleGuide}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`} fill="none" stroke="#1f2937" strokeWidth="3" />
        <Line x1={centerX - radius - 8} y1={centerY} x2={centerX + radius + 8} y2={centerY} stroke="#1f2937" strokeWidth="3" />
        {[44, 84].map((innerRadius) => (
          <Path key={innerRadius} d={`M ${centerX - innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 0 1 ${centerX + innerRadius} ${centerY}`} fill="none" stroke="#d1d5db" strokeWidth="2" />
        ))}
        {ticks.map((tick) => {
          const rad = (tick * Math.PI) / 180;
          const outerX = centerX + radius * Math.cos(rad);
          const outerY = centerY - radius * Math.sin(rad);
          const innerX = centerX + (radius - (tick % 30 === 0 ? 18 : 10)) * Math.cos(rad);
          const innerY = centerY - (radius - (tick % 30 === 0 ? 18 : 10)) * Math.sin(rad);
          const labelX = centerX + (radius - 32) * Math.cos(rad);
          const labelY = centerY - (radius - 32) * Math.sin(rad);
          return (
            <React.Fragment key={tick}>
              <Line x1={innerX} y1={innerY} x2={outerX} y2={outerY} stroke="#4b5563" strokeWidth={tick % 30 === 0 ? 2 : 1} />
              {tick % 30 === 0 && (
                <SvgText x={labelX} y={labelY + 4} fill={tick === angle ? '#d4183d' : '#374151'} fontSize="12" fontWeight="700" textAnchor="middle">
                  {tick}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
        <Line x1={centerX} y1={centerY} x2={lineX} y2={lineY} stroke="#9C27B0" strokeWidth="6" strokeLinecap="round" />
        <Circle cx={centerX} cy={centerY} r="6" fill="#9C27B0" />
      </Svg>
      <Text style={compact ? s.angleOverlayText : s.angle}>{angle}°</Text>
    </View>
  );
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

function AngleToolScreen({ angle, onAngleChange, onNext }: { angle: number; onAngleChange: (angle: number) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const changeAngle = (nextAngle: number) => onAngleChange(Math.min(180, Math.max(0, nextAngle)));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('handFan.angleTool')}</Text>
      <Text style={[s.body, { marginBottom: 12 }]}>{t('handFan.angleSub')}</Text>
      <SpeechButton text={t('handFan.angleSub')} style={s.speech} />
      <View style={s.center}>
        <AngleGuide angle={angle} />
        <View style={s.sliderRow}>
          <TouchableOpacity style={s.roundBtn} onPress={() => changeAngle(angle - 5)}>
            <Text style={s.btnText}>-</Text>
          </TouchableOpacity>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { width: `${(angle / 180) * 100}%` }]} />
          </View>
          <TouchableOpacity style={s.roundBtn} onPress={() => changeAngle(angle + 5)}>
            <Text style={s.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('handFan.saveAngle')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MatrixInputScreen({ matrix, onChange, onNext }: { matrix: MatrixData; onChange: (matrix: MatrixData) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const designs = [t('data.triangleFold'), t('data.accordion'), t('data.simpleWave'), t('data.doubleLayer')];
  const distances = ['15cm', '30cm', '45cm'];
  const best = getBestMatrixResult(matrix);

  const updateCell = (design: string, distance: string, value: string) => {
    onChange({
      ...matrix,
      [design]: {
        ...(matrix[design] ?? {}),
        [distance]: value.replace(/[^0-9.,]/g, ''),
      },
    });
  };

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('handFan.matrixInput')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.matrixSub')}</Text>
      <View style={[s.tableRow, s.tableHead]}>
        <Text style={[s.tableCell, s.tableHeadText, { flex: 2 }]}>{t('handFan.fanDesign')}</Text>
        {distances.map((distance) => <Text key={distance} style={[s.tableCell, s.tableHeadText]}>{distance}</Text>)}
      </View>
      {designs.map((design) => (
        <View key={design} style={s.tableRow}>
          <Text style={[s.tableCell, { flex: 2 }]}>{design}</Text>
          {distances.map((distance) => (
            <TextInput
              key={`${design}-${distance}`}
              keyboardType="decimal-pad"
              onChangeText={(value) => updateCell(design, distance, value)}
              placeholder="0°"
              style={s.tableInput}
              value={matrix[design]?.[distance] ?? ''}
            />
          ))}
        </View>
      ))}
      <View style={s.section}>
        <Text style={s.cardTitle}>
          {t('handFan.bestPerformer')}: {best ? `${best.design} (${best.distance}, ${best.angle}°)` : t('handFan.noMatrixData')}
        </Text>
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

function PhotoProofScreen({ angle, onAngleChange, onNext }: { angle: number; onAngleChange: (angle: number) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const changeAngle = (nextAngle: number) => onAngleChange(Math.min(180, Math.max(0, nextAngle)));

  const capturePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
    if (photo?.uri) setPhotos((previous) => [photo.uri, ...previous].slice(0, 4));
  };

  if (!permission) {
    return (
      <View style={[s.pad, s.center]}>
        <Text style={s.body}>{t('handFan.cameraLoading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[s.pad, s.center]}>
        <Text style={[s.heading, { textAlign: 'center' }]}>{t('handFan.cameraPermission')}</Text>
        <TouchableOpacity style={s.btn} onPress={requestPermission}>
          <Text style={s.btnText}>{t('handFan.allowCamera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.outlineBtn} onPress={onNext}>
          <Text style={s.outlineBtnText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('handFan.photoProof')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.photoSub')}</Text>
      <View style={s.cameraView}>
        <CameraView ref={cameraRef} facing="back" style={s.cameraPreview} />
        <View pointerEvents="none" style={s.cameraOverlay}>
          <AngleGuide angle={angle} compact />
        </View>
      </View>
      <View style={s.sliderRow}>
        <TouchableOpacity style={s.roundBtn} onPress={() => changeAngle(angle - 5)}>
          <Text style={s.btnText}>-</Text>
        </TouchableOpacity>
        <View style={s.sliderTrack}>
          <View style={[s.sliderFill, { width: `${(angle / 180) * 100}%` }]} />
        </View>
        <TouchableOpacity style={s.roundBtn} onPress={() => changeAngle(angle + 5)}>
          <Text style={s.btnText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.photoAngleLabel}>{angle}°</Text>
      {photos.length > 0 && (
        <View style={s.photoStrip}>
          {photos.map((uri) => (
            <Image key={uri} source={{ uri }} style={s.photoThumb} />
          ))}
        </View>
      )}
      <TouchableOpacity style={s.btn} onPress={capturePhoto}>
        <Text style={s.btnText}>{t('handFan.capturePhoto')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.outlineBtn} onPress={onNext}>
        <Text style={s.outlineBtnText}>{t('common.next')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LeaderboardScreen({ matrix, onNext }: { matrix: MatrixData; onNext: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const best = getBestMatrixResult(matrix);
  const values = getMatrixNumbers(matrix);
  const average = values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : '-';

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.leaderboard')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.topPerformers')}</Text>
      {team ? (
        <View style={[s.lbRow, s.lbFirst]}>
          <Text style={s.rank}>1.</Text>
          <View style={s.flex}>
            <Text style={s.cardTitle}>{team.teamName}</Text>
            <Text style={s.body}>{values.length} {t('data.attempts')} | {average}° {t('data.average')}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.body}>{t('data.bendAngle')}</Text>
            <Text style={s.score}>{best ? `${best.angle}°` : '-'}</Text>
          </View>
        </View>
      ) : (
        <View style={s.section}>
          <Text style={s.body}>{t('handFan.noLeaderboardData')}</Text>
        </View>
      )}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.writeUp')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const fields = translatedArray(t('handFan.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.writeUp')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('handFan.writeSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      <ReflectionForm activityId="handFan" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function HandFanActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [guideAngle, setGuideAngle] = useState(45);
  const [matrix, setMatrix] = useState<MatrixData>({});
  const total = 7;

  return (
    <View style={s.root}>
      <ActivityHeader title={t('handFan.title')} step={step} total={total} color="#9C27B0" onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <SetupGuideScreen onNext={() => setStep(2)} />}
        {step === 2 && <AngleToolScreen angle={guideAngle} onAngleChange={setGuideAngle} onNext={() => setStep(3)} />}
        {step === 3 && <MatrixInputScreen matrix={matrix} onChange={setMatrix} onNext={() => setStep(4)} />}
        {step === 4 && <StiffnessRefScreen onNext={() => setStep(5)} />}
        {step === 5 && <PhotoProofScreen angle={guideAngle} onAngleChange={setGuideAngle} onNext={() => setStep(6)} />}
        {step === 6 && <LeaderboardScreen matrix={matrix} onNext={() => setStep(7)} />}
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
  angleGuide: { alignItems: 'center', marginBottom: 18, width: '100%' },
  angleGuideCompact: { alignItems: 'center', width: '100%' },
  angle: { color: '#9C27B0', fontSize: 44, fontWeight: '900', marginTop: -8 },
  angleOverlayText: { backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 12, color: '#9C27B0', fontSize: 24, fontWeight: '900', marginTop: -24, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 4 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: stemmColors.blue, alignItems: 'center', justifyContent: 'center' },
  sliderTrack: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  sliderFill: { height: 10, backgroundColor: '#9C27B0' },
  tableRow: { flexDirection: 'row', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 8 },
  tableHead: { backgroundColor: stemmColors.blue },
  tableHeadText: { color: '#fff', fontWeight: '800' },
  tableCell: { flex: 1, color: stemmColors.text, fontSize: 14, textAlign: 'center' },
  tableInput: { borderColor: stemmColors.border, borderRadius: 10, borderWidth: 1, color: stemmColors.text, flex: 1, fontSize: 14, marginHorizontal: 3, minHeight: 42, paddingHorizontal: 6, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  cameraView: { backgroundColor: '#111827', borderRadius: 16, height: 330, justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  cameraPreview: { ...StyleSheet.absoluteFillObject },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  cameraText: { color: '#fff', fontSize: 44, fontWeight: '900' },
  photoAngleLabel: { color: '#9C27B0', fontSize: 20, fontWeight: '900', marginBottom: 10, marginTop: 6, textAlign: 'center' },
  photoStrip: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  photoThumb: { backgroundColor: '#e5e7eb', borderRadius: 10, height: 74, width: 74 },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  lbFirst: { backgroundColor: stemmColors.greenSoft, borderColor: stemmColors.green, borderWidth: 2 },
  rank: { color: stemmColors.blue, fontSize: 20, fontWeight: '900', width: 36 },
  score: { color: '#9C27B0', fontSize: 20, fontWeight: '900' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, backgroundColor: '#f9fafb', color: stemmColors.text, fontSize: 16, minHeight: 80 },
});
