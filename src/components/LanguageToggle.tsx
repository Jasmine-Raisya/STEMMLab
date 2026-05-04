import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppLanguage } from '../services/i18n';
import { useLanguage } from '../services/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const options: AppLanguage[] = ['en', 'id'];

  return (
    <View accessibilityLabel={t('common.language')} style={styles.wrap}>
      {options.map((option) => {
        const selected = language === option;
        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => setLanguage(option)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option === 'en' ? t('common.english') : t('common.indonesian')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EF',
    borderColor: '#A9D8C7',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  option: {
    borderRadius: 12,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selected: { backgroundColor: '#0B5D4C' },
  label: { color: '#0B2742', fontSize: 16, fontWeight: '700' },
  selectedLabel: { color: '#FFFFFF' },
});
