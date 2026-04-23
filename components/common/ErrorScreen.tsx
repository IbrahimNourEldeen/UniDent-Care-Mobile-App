import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import {
  ShieldOff,
  Lock,
  AlertTriangle,
  SearchX,
  ArrowLeft,
  RefreshCw,
  Home,
  type LucideIcon,
} from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type ErrorType = 400 | 401 | 403 | 404;

interface ErrorConfig {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: [string, string, ...string[]];
  accentColor: string;
  accentDark: string;
  bgTint: string;
  bgTintDark: string;
}


// ─── Config Map ───────────────────────────────────────────────────────────────

const ERROR_CONFIG: Record<ErrorType, ErrorConfig> = {
  400: {
    code: '400',
    title: 'Invalid Request',
    subtitle: 'Something looks off',
    description:
      'The request could not be understood. Please check your inputs and try again. If the problem persists, contact support.',
    icon: AlertTriangle,
    gradient: ['#f59e0b', '#d97706'],
    accentColor: '#d97706',
    accentDark: '#fbbf24',
    bgTint: '#fef3c7',
    bgTintDark: '#451a03',
  },
  401: {
    code: '401',
    title: 'Session Expired',
    subtitle: 'You are not authenticated',
    description:
      'Your session has expired or you are not logged in. Please sign in again to continue.',
    icon: Lock,
    gradient: ['#6366f1', '#4f46e5'],
    accentColor: '#4f46e5',
    accentDark: '#818cf8',
    bgTint: '#ede9fe',
    bgTintDark: '#1e1b4b',
  },
  403: {
    code: '403',
    title: 'Access Denied',
    subtitle: 'You don\'t have permission',
    description:
      'You do not have the necessary permissions to view this page. Contact your administrator if you believe this is a mistake.',
    icon: ShieldOff,
    gradient: ['#ef4444', '#dc2626'],
    accentColor: '#dc2626',
    accentDark: '#f87171',
    bgTint: '#fee2e2',
    bgTintDark: '#450a0a',
  },
  404: {
    code: '404',
    title: 'Not Found',
    subtitle: 'This page doesn\'t exist',
    description:
      'The page or resource you are looking for could not be found. It may have been moved, deleted, or never existed.',
    icon: SearchX,
    gradient: ['#64748b', '#475569'],
    accentColor: '#475569',
    accentDark: '#94a3b8',
    bgTint: '#f1f5f9',
    bgTintDark: '#1e293b',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ErrorScreenProps {
  type: ErrorType;
  /** Optional override for the description */
  message?: string;
  /** Called when the primary CTA is tapped (default: go back) */
  onPrimaryAction?: () => void;
  /** Label for primary CTA */
  primaryLabel?: string;
  /** Whether to show a secondary "Go Home" button */
  showHome?: boolean;
  /** Whether to show a "Retry" button */
  showRetry?: boolean;
  /** Called when retry is tapped */
  onRetry?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ErrorScreen({
  type,
  message,
  onPrimaryAction,
  primaryLabel,
  showHome = false,
  showRetry = false,
  onRetry,
}: ErrorScreenProps) {
  const router = useRouter();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';

  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  const accent = isDark ? config.accentDark : config.accentColor;
  const bgTint = isDark ? config.bgTintDark : config.bgTint;

  const handlePrimary = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(screens)' as any);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f8fafc' },
      ]}
    >
      {/* Background decorative circle */}
      <View
        style={[
          styles.bgCircle,
          { backgroundColor: bgTint, opacity: isDark ? 0.5 : 0.7 },
        ]}
      />

      <View style={styles.content}>
        {/* Icon container */}
        <View style={[styles.iconWrapper, { backgroundColor: bgTint }]}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Icon size={38} color="white" strokeWidth={1.8} />
          </LinearGradient>
        </View>

        {/* Error code badge */}
        <View style={[styles.codeBadge, { backgroundColor: bgTint }]}>
          <Text style={[styles.codeText, { color: accent }]}>
            {config.code}
          </Text>
        </View>

        {/* Text block */}
        <Text
          style={[
            styles.title,
            { color: isDark ? '#f1f5f9' : '#0f172a' },
          ]}
        >
          {config.title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: accent },
          ]}
        >
          {config.subtitle}
        </Text>
        <Text
          style={[
            styles.description,
            { color: isDark ? '#94a3b8' : '#64748b' },
          ]}
        >
          {message ?? config.description}
        </Text>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
          ]}
        />

        {/* Actions */}
        <View style={styles.actions}>
          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePrimary}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              <ArrowLeft size={16} color="white" />
              <Text style={styles.primaryBtnText}>
                {primaryLabel ?? 'Go Back'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Retry button */}
          {showRetry && (
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                },
              ]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <RefreshCw size={14} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text
                style={[
                  styles.secondaryBtnText,
                  { color: isDark ? '#94a3b8' : '#64748b' },
                ]}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          )}

          {/* Home button */}
          {showHome && (
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                },
              ]}
              onPress={() => router.replace('/(screens)' as any)}
              activeOpacity={0.8}
            >
              <Home size={14} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text
                style={[
                  styles.secondaryBtnText,
                  { color: isDark ? '#94a3b8' : '#64748b' },
                ]}
              >
                Go to Home
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -80,
    right: -80,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  iconGradient: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 14,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 320,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 28,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
