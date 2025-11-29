import { View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { createHomeStyles } from '@/assets/styles/home.styles';
import ContactSelector from '../components/ContactSelector';

export default function Index() {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);
  
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Erreur', 'Disponible uniquement sur Android');
      return;
    }

    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      ]);

      const smsGranted = results['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED;
      const contactsGranted = results['android.permission.READ_CONTACTS'] === PermissionsAndroid.RESULTS.GRANTED;

      if (smsGranted && contactsGranted) {
        setHasPermission(true);
      } else if (smsGranted && !contactsGranted) {
        Alert.alert(
          'Permission partielle',
          'SMS autorisés mais pas les contacts. Les numéros seront affichés sans noms.'
        );
        setHasPermission(true);
      } else {
        Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès aux SMS et contacts');
      }
    } catch (err) {
      console.error('Erreur:', err);
      Alert.alert('Erreur', String(err));
    }
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={homeStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        {!hasPermission ? (
          <View style={homeStyles.content}>
            <Ionicons name="chatbubbles" size={80} color={colors.primary} />
            <Text style={homeStyles.title}>SMS Reader</Text>
            <Text style={homeStyles.subtitle}>
              Pour commencer, autorisez l'accès aux SMS et contacts
            </Text>
            <TouchableOpacity onPress={requestPermissions} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradients.primary} style={homeStyles.button}>
                <Ionicons name="lock-open" size={20} color="#fff" />
                <Text style={homeStyles.buttonText}>Autoriser l'accès</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ContactSelector />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
