import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useRoute, RouteProp } from '@react-navigation/native';
import KeyValueView from '../components/KeyValueView';
import { RootStackParamList } from '../types';

export const ResultsScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'Results'>>();
  const { ic, text } = route.params;
  const tryJson = useMemo(() => {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }, [text]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.headerCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>        
        <Text style={[styles.icTitle, { color: theme.colors.text }]}>{ic}</Text>
  <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>Database Result</Text>
      </View>
      {tryJson ? (
        <KeyValueView data={tryJson} />
      ) : (
        <View style={[styles.rawCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>
          <Text selectable style={{ color: theme.colors.textSecondary }}>{text}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerCard: { padding: 16, borderWidth: 1, borderRadius: 14, marginBottom: 16 },
  icTitle: { fontSize: 22, fontWeight: '700' },
  grid: { flexDirection: 'column' },
  field: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  rawCard: { padding: 16, borderWidth: 1, borderRadius: 12, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 }
});

export default ResultsScreen;
