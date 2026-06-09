export const brandColors = {
  cream: '#F2E7DF',
  blush: '#FFEBF3',
  oliveGold: '#CFC46B',
  coral: '#F5674D',
  charcoal: '#343133',
  muted: '#806E63',
  lightBorder: '#D5C8BE',
  lightElevated: '#FFF8F3',
  darkSurface: '#433D3B',
  darkCard: '#4D4643',
  darkElevated: '#5A514D',
  darkBorder: '#756A64',
  darkMuted: '#E0D1C7',
  danger: '#d4183d',
  white: '#FFFFFF',
};

export const spacing = {
  sp4: 4,
  sp8: 8,
  sp12: 12,
  sp16: 16,
  sp20: 20,
  sp24: 24,
  sp32: 32,
  sp48: 48,
};

export const radius = {
  radiusSm: 8,
  radiusMd: 14,
  radiusLg: 20,
  radiusXl: 32,
  radiusFull: 9999,
};

export const typography = {
  heading1: { fontFamily: 'Aileron-Black', fontSize: 34, fontWeight: '900' as const },
  heading2: { fontFamily: 'Aileron-Black', fontSize: 28, fontWeight: '900' as const },
  heading3: { fontFamily: 'Aileron-Bold', fontSize: 22, fontWeight: '700' as const },
  body: { fontFamily: 'Aileron-Regular', fontSize: 16, fontWeight: '400' as const },
  caption: { fontFamily: 'Aileron-Regular', fontSize: 13, fontWeight: '400' as const },
  mono: { fontFamily: 'Fira Code', fontSize: 14, fontWeight: '400' as const },
};

export const shadow = {
  shadowColor: brandColors.charcoal,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
  shadowRadius: 18,
  elevation: 6,
};
