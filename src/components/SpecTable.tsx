import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type Row = { label: string; value?: string | string[] };

export const SpecTable: React.FC<{ rows: Row[] }> = ({ rows }) => {
  const { theme } = useTheme();
  const filtered = rows.filter(r => {
    if (!r.value) return false;
    if (Array.isArray(r.value)) return r.value.length > 0 && r.value.join('').trim() !== '';
    return r.value.trim() !== '';
  });
  if (filtered.length === 0) return null;
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>      
      {filtered.map((r, idx) => {
        const display = Array.isArray(r.value) ? r.value.join(', ') : r.value;
        return (
          <View key={r.label} style={[styles.row, { borderColor: theme.colors.border, borderBottomWidth: idx === filtered.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>          
            <Text style={[styles.cellLabel, { color: theme.colors.text }]}>{r.label}</Text>
            <Text style={[styles.cellValue, { color: theme.colors.textSecondary }]}>{display}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14 },
  cellLabel: { fontWeight: '600', flex: 1, paddingRight: 12 },
  cellValue: { flex: 1, textAlign: 'right' }
});

export default SpecTable;
