import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const CameraScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Camera'>>();
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const takePhoto = async () => {
    if (!camRef.current || busy) return;
    setBusy(true);
    setError(undefined);
    try {
  const photo: CameraCapturedPicture = await (camRef.current as unknown as { takePictureAsync: (opts: { base64: boolean; quality: number; skipProcessing: boolean }) => Promise<CameraCapturedPicture> }).takePictureAsync({ base64: true, quality: 0.6, skipProcessing: true });
      const base64 = photo.base64;
      const uri = photo.uri;
      // OCR removed; navigate back without auto-filled code
      navigation.navigate('Search', { icFromCamera: '', lastImageUri: uri || undefined });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to capture';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    // permission is being checked
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>        
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background, padding: 24 }]}>        
        <Text style={{ color: theme.colors.text, textAlign: 'center', marginBottom: 12 }}>We need your permission to show the camera</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.primary }]} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkBtn]} onPress={() => navigation.goBack()}>
          <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
  <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing="back">
        {/* Overlay Controls */}
        <View style={[styles.overlay, { backgroundColor: 'transparent' }]}>
          {error ? <Text style={[styles.error, { backgroundColor: '#0008', color: '#fff' }]}>{error}</Text> : null}
          <TouchableOpacity onPress={takePhoto} disabled={busy} style={[styles.shutter, { borderColor: busy ? '#aaa' : '#fff' }]} />
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24 },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 6, backgroundColor: '#ffffff22' },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  linkBtn: { marginTop: 12, padding: 8 },
  linkText: { fontWeight: '600' },
  error: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 }
});

export default CameraScreen;
