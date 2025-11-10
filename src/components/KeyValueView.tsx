import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Allow unknown, but avoid 'any' for lint. We operate reflectively.
type JsonObject = { [key: string]: unknown };
type Json = JsonObject | unknown[];

function isPlainObject(v: unknown): v is JsonObject {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

const KeyValueRow: React.FC<{ label: string; children: React.ReactNode } > = ({ label, children }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}>      
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.valueContainer}>{children}</View>
    </View>
  );
};

export const KeyValueView: React.FC<{ data: Json }> = ({ data }) => {
  const { theme } = useTheme();

  const renderValue = (val: unknown, depth = 0): React.ReactNode => {
    if (val === null || val === undefined) return <Text style={{ color: theme.colors.textSecondary }}>—</Text>;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      return <Text style={{ color: theme.colors.textSecondary }}>{String(val)}</Text>;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return <Text style={{ color: theme.colors.textSecondary }}>[]</Text>;
      // If array of primitives, show inline
      const primaries = val.every(v => v === null || ['string','number','boolean'].includes(typeof v));
      if (primaries) return <Text style={{ color: theme.colors.textSecondary }}>{val.map(v => String(v)).join(', ')}</Text>;
      // Else render stacked
      return (
        <View style={{ marginTop: 6 }}>
          {val.map((v, i) => (
            <View key={i} style={{ marginBottom: 6, paddingLeft: 12, borderLeftWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border }}>
              {renderValue(v, depth + 1)}
            </View>
          ))}
        </View>
      );
    }
    if (isPlainObject(val)) {
      const entries = Object.entries(val);
      if (entries.length === 0) return <Text style={{ color: theme.colors.textSecondary }}>{'{}'}</Text>;
      return (
        <View style={{ marginTop: 6 }}>
          {entries.map(([k, v]) => (
            <KeyValueRow key={k} label={k}>
              {renderValue(v, depth + 1)}
            </KeyValueRow>
          ))}
        </View>
      );
    }
    return <Text style={{ color: theme.colors.textSecondary }}>{String(val)}</Text>;
  };

  if (isPlainObject(data)) {
    const entries = Object.entries(data);
    if (entries.length === 0) return null;
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>        
        {entries.map(([k, v]) => (
          <KeyValueRow key={k} label={k}>
            {renderValue(v, 1)}
          </KeyValueRow>
        ))}
      </View>
    );
  }
  // Fallback: show raw value
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>      
      {renderValue(data)}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontWeight: '600', marginBottom: 4 },
  valueContainer: { },
});

export default KeyValueView;
