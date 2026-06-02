import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTeam } from '../services/teamContext';

interface Props { onNext: () => void; }

export function TeamSetupScreen({ onNext }: Props) {
  const { t } = useTranslation();
  const { setTeam } = useTeam();
  
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [yearLevel, setYearLevel] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (text: string, index: number) => {
    const updated = [...members];
    updated[index] = text;
    setMembers(updated);
  };

  const handleContinue = async () => {
    if (!teamName.trim()) return;
    
    const cleanMembers = members.filter((m) => m.trim() !== '');
    const generatedId = `${teamName.trim()} #${Math.floor(1000 + Math.random() * 9000)}`;
    
    await setTeam({
      id: generatedId,
      teamId: generatedId,
      teamName: teamName.trim(),
      members: cleanMembers,
      yearLevel: yearLevel.trim(),
    });
    
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.teamSetup')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.createProfile')}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t('common.teamName')}</Text>
        <TextInput 
          style={styles.input} 
          value={teamName} 
          onChangeText={setTeamName} 
          placeholder="Enter team name"
        />

        <View style={styles.rowHeader}>
          <Text style={styles.label}>{t('common.teamMembers')}</Text>
        </View>

        {members.map((member, index) => (
          <View key={index} style={styles.memberRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]} 
              value={member} 
              onChangeText={(text) => handleMemberChange(text, index)}
            />
            <TouchableOpacity onPress={() => handleRemoveMember(index)}>
              <Text style={styles.removeIcon}>x</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={[styles.memberRow, { marginTop: 8 }]}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Add new member name..."
            value={newMemberName}
            onChangeText={setNewMemberName}
          />
          <TouchableOpacity onPress={handleAddMember}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>{t('common.yearLevel')}</Text>
        <TextInput
          style={styles.input}
          value={yearLevel}
          onChangeText={setYearLevel}
          keyboardType="numeric"
          placeholder="7"
        />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.btn, !teamName.trim() && { opacity: 0.6 }]} 
        onPress={handleContinue} 
        disabled={!teamName.trim()}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>{t('onboarding.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48, backgroundColor: '#fff' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#2F3E46', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#7A8A99' },
  form: { flex: 1 },
  label: { fontSize: 16, color: '#2F3E46', fontWeight: '800', marginBottom: 6 },
  input: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f9fafb', color: '#2F3E46', marginBottom: 12, fontSize: 16 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addIcon: { fontSize: 22, color: '#0074D9', fontWeight: '900', paddingHorizontal: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeIcon: { fontSize: 18, color: '#d4183d', paddingHorizontal: 8, fontWeight: '900' },
  btn: { paddingVertical: 16, borderRadius: 14, backgroundColor: '#0074D9', alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
