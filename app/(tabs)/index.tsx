import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { getAllSMS, SMS } from '@/utils/smsReader';

export default function Index() {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState(false);
  const [messages, setMessages] = useState<SMS[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requestSMSPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Erreur', 'Disponible uniquement sur Android');
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'Permission SMS',
          message: 'Cette application a besoin d\'accéder à vos SMS',
          buttonPositive: 'Accepter',
          buttonNegative: 'Refuser',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
        // Lire les SMS automatiquement après permission
        loadSMS();
      } else {
        Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès');
      }
    } catch (err) {
      console.error('Erreur:', err);
      Alert.alert('Erreur', String(err));
    }
  };

  const loadSMS = async () => {
    setIsLoading(true);
    try {
      const sms = await getAllSMS();
      setMessages(sms);
      Alert.alert('Succès !', `${sms.length} SMS chargés !`);
    } catch (error) {
      console.error('Erreur chargement SMS:', error);
      Alert.alert('Erreur', 'Impossible de charger les SMS');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={styles.safeArea}>
        {!hasPermission ? (
          <View style={styles.content}>
            <Ionicons name="chatbubbles" size={80} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>SMS Reader</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Pour commencer, autorisez l'accès aux SMS
            </Text>
            <TouchableOpacity onPress={requestSMSPermission} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradients.primary} style={styles.button}>
                <Ionicons name="lock-open" size={20} color="#fff" />
                <Text style={styles.buttonText}>Autoriser l'accès aux SMS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.messagesContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Vos SMS ({messages.length})
            </Text>
            
            {isLoading ? (
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Chargement...
              </Text>
            ) : (
              <ScrollView style={styles.messagesList}>
                {messages.map((msg) => (
                  <View key={msg.id} style={[styles.messageItem, { borderColor: colors.border }]}>
                    <Text style={[styles.messageAddress, { color: colors.primary }]}>
                      {msg.address}
                    </Text>
                    <Text style={[styles.messageBody, { color: colors.text }]} numberOfLines={2}>
                      {msg.body}
                    </Text>
                    <Text style={[styles.messageDate, { color: colors.textMuted }]}>
                      {new Date(msg.date).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messagesList: {
    flex: 1,
    marginTop: 20,
  },
  messageItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  messageAddress: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  messageBody: {
    fontSize: 14,
    marginBottom: 5,
  },
  messageDate: {
    fontSize: 12,
  },
});
