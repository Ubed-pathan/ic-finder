import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store';
// removed unused camera imports here; camera screen handles capture
import { searchIcInDb } from '../api/db';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useEffect } from 'react';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const store = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Search'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Search'>>();
  const [icInput, setIcInput] = useState('');
  
  useEffect(() => {
    const prefill = route.params?.icFromCamera;
    if (prefill && prefill.trim() && prefill.trim() !== icInput) {
      setIcInput(prefill.trim());
    }
  }, [route.params?.icFromCamera]);


  const handlePick = async () => {
    // Redirect to dedicated camera screen for more reliable capture and permission handling
    navigation.navigate('Camera');
  };

  const handleSearch = async () => {
    const normalized = icInput.trim();
    if (!normalized) return;
    // If already searched, show existing result without requery
    const existing = store.history.find(h => h.ic.toLowerCase() === normalized.toLowerCase());
    if (existing) {
      navigation.navigate('Results', { ic: existing.ic, parsed: existing, text: existing.text || '' });
      return;
    }
    try {
      store.setLoading(true);
      store.setError(undefined);
      const text = await searchIcInDb(normalized);
      const result = { ic: normalized, text };
      store.addResult(result);
      navigation.navigate('Results', { ic: normalized, parsed: {}, text });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Search failed';
      store.setError(msg);
    }
    finally { store.setLoading(false); }
  };

  const handleDelete = (ic: string) => {
    Alert.alert('Delete entry?', ic, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => useAppStore.getState().removeResult(ic) }
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear all history?', 'This will remove all saved results.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => useAppStore.getState().clearHistory() }
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: theme.spacing(4), paddingTop: theme.spacing(2) }}>
      <Text style={[styles.title, { color: theme.colors.text }]}>IC Finder</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Search by IC number or capture chip image.</Text>

      {store.error && (
        <View style={[styles.card, { backgroundColor: '#FFE6E6', borderColor: '#FFB3B3' }]}>        
          <Text style={{ color: '#8A1F1F' }}>Error: {store.error}</Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>        
        <TextInput
          placeholder="Enter IC number"
          placeholderTextColor={theme.colors.textSecondary}
          value={icInput}
          onChangeText={setIcInput}
          style={[styles.input, { color: theme.colors.text }]}
        />
        <View style={styles.row}>          
          <TouchableOpacity style={[styles.button, styles.rowGap, { backgroundColor: theme.colors.primary }]}
            onPress={handleSearch} disabled={store.loading}>
            <Text style={styles.buttonText}>{store.loading ? 'Searching...' : 'Search'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonOutline, { borderColor: theme.colors.primary }]} onPress={handlePick}>
            <Text style={[styles.buttonTextOutline, { color: theme.colors.primary }]}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>History</Text>
          {store.history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        {store.history.length === 0 && (
          <Text style={{ color: theme.colors.textSecondary }}>No searches yet.</Text>
        )}
        {store.history.map((h) => (
          <TouchableOpacity
            key={h.ic}
            style={styles.historyCard}
            onPress={() => navigation.navigate('Results', { ic: h.ic, parsed: h, text: h.text || '' })}
            activeOpacity={0.7}
          >
            <Text style={[styles.historyIc, { color: theme.colors.text }]}>{h.ic}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {h.manufacturer || 'Unknown'} • {h.ram || '--'} • {h.storage || '--'} • {h.dramType || ''}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(h.ic)} style={{ position: 'absolute', right: 10, top: 10, padding: 6 }}>
              <Text style={{ color: '#D11A2A', fontWeight: '700' }}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, marginBottom: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', marginTop: 12 },
  rowGap: { marginRight: 12 },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonOutline: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
  buttonTextOutline: { fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  historyItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyCard: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 10 },
  historyIc: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  preview: { width: '100%', height: 180, borderRadius: 8, marginTop: 12, resizeMode: 'cover' },
  
});

export default SearchScreen;
