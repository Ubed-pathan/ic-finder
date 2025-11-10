import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated, Easing, Modal, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import { useAppStore } from '../store';
import { useTheme } from '../theme/ThemeProvider';

interface ExtraConfig {
  geminiApiKeys?: string[];
}

const maskKey = (key: string) => {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return trimmed.replace(/./g, '•');
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
};

const KeySelector: React.FC = () => {
  const { theme } = useTheme();
  const store = useAppStore();
  const [open, setOpen] = useState(false);
  const DROPDOWN_WIDTH = 180; // must match styles.dropdown.width
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number }>();
  const extra = Constants.expoConfig?.extra as ExtraConfig | undefined;
  const keys = useMemo(() => (extra?.geminiApiKeys || []).filter(Boolean), [extra]);
  const activeIdx = store.selectedApiKeyIdx ?? 0;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 140, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [open, scaleAnim, fadeAnim]);

  if (!keys || keys.length <= 1) return null;

  const openMenu = () => {
    // Measure trigger position in window to anchor modal dropdown
    type Measurable = { measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void };
    requestAnimationFrame(() => {
      (triggerRef.current as unknown as Measurable)?.measureInWindow?.((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setOpen(true);
      });
    });
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel="Select Gemini API key"
        onPress={() => (open ? setOpen(false) : openMenu())}
        style={[styles.trigger, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, { color: theme.colors.textSecondary }]}>
          Key {activeIdx + 1} ▾
        </Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        {(() => {
          const screen = Dimensions.get('window');
          const top = (anchor?.y ?? 0) + (anchor?.height ?? 0) + 6;
          // Align dropdown's right edge with trigger's right edge, then clamp within screen
          const desiredLeft = ((anchor?.x ?? 0) + (anchor?.width ?? 0)) - DROPDOWN_WIDTH;
          const left = Math.min(Math.max(desiredLeft, 8), screen.width - DROPDOWN_WIDTH - 8);
          return (
            <Animated.View
              style={[
                styles.dropdown,
                {
                  top: Math.max(8, top),
                  left,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                  zIndex: 9999,
                  elevation: 9999,
                },
              ]}
            >
              {keys.map((k, i) => {
                const active = i === activeIdx;
                return (
                  <TouchableOpacity
                    key={`api-key-${i}`}
                    style={[styles.option, active && { backgroundColor: theme.colors.primary + '22' }]}
                    onPress={() => {
                      store.setSelectedApiKeyIdx(i);
                      setOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionLabel, { color: theme.colors.text }]}>{`Key ${i + 1}`}</Text>
                        <Text style={[styles.optionSub, { color: theme.colors.textSecondary }]}>{maskKey(k)}</Text>
                      </View>
                      {active && (
                        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          );
        })()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { position: 'relative', marginRight: 4, zIndex: 50 },
  trigger: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  triggerText: { fontSize: 12, fontWeight: '600' },
  dropdown: { position: 'absolute', top: 40, width: 180, borderWidth: 1, borderRadius: 14, paddingVertical: 4, elevation: 12, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, zIndex: 9999 },
  option: { paddingHorizontal: 14, paddingVertical: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { fontSize: 13, fontWeight: '600' },
  optionSub: { fontSize: 11, marginTop: 2 },
});

export default KeySelector;
