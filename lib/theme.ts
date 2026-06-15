// VictoryRevConnect Boaters — Design System
// Blueprint section 4: Brand colors and aesthetic

export const colors = {
  // Primary palette
  navy: '#0A2240',
  red: '#C8102E',
  white: '#FFFFFF',
  nearBlack: '#1a1a1a',

  // Semantic
  background: '#FFFFFF',
  surface: '#F4F6F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textNavy: '#0A2240',

  // Action — red used sparingly
  actionPrimary: '#C8102E',
  actionPrimaryHover: '#A50D26',
  actionSecondary: '#0A2240',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Trial / subscription UI
  trialBanner: '#0A2240',
  trialBannerText: '#FFFFFF',
  trialAccent: '#C8102E',

  // Agent chat
  agentBubble: '#F1F5F9',
  agentBubbleText: '#1a1a1a',
  userBubble: '#0A2240',
  userBubbleText: '#FFFFFF',
  citationChip: '#EFF6FF',
  citationChipBorder: '#BFDBFE',
  citationChipText: '#1D4ED8',

  // Map
  meetupPin: '#C8102E',
  businessPin: '#0A2240',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.7,

  // Font weights (React Native style)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
}

export const tabBarConfig = {
  activeTintColor: colors.navy,
  inactiveTintColor: colors.textTertiary,
  backgroundColor: colors.white,
  borderTopColor: colors.border,
}
