import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { getAllSMS, organizeByConversation, Conversation, getAllContacts } from '@/utils/smsReader';
import { router } from 'expo-router';

export default function Index() {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

const requestPermissions = async () => {
  if (Platform.OS !== 'android') {
    Alert.alert('Erreur', 'Disponible uniquement sur Android');
    return;
  }

  try {
    // Demander les deux permissions en même temps
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    ]);

    const smsGranted = results['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED;
    const contactsGranted = results['android.permission.READ_CONTACTS'] === PermissionsAndroid.RESULTS.GRANTED;

    if (smsGranted && contactsGranted) {
      setHasPermission(true);
      loadSMS();
    } else if (smsGranted && !contactsGranted) {
      Alert.alert(
        'Permission partielle',
        'SMS autorisés mais pas les contacts. Les numéros seront affichés sans noms.'
      );
      setHasPermission(true);
      loadSMS();
    } else {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès aux SMS');
    }
  } catch (err) {
    console.error('Erreur:', err);
    Alert.alert('Erreur', String(err));
  }
};

const loadSMS = async () => {
  setIsLoading(true);
  try {
    // Charger les SMS et les contacts en parallèle
    const [sms, contacts] = await Promise.all([
      getAllSMS(),
      getAllContacts(),
    ]);
    
    // Organiser avec les contacts
    const organized = organizeByConversation(sms, contacts);
    setConversations(organized);
    
    Alert.alert('Succès !', `${organized.length} conversations chargées !`);
  } catch (error) {
    console.error('Erreur chargement:', error);
    Alert.alert('Erreur', 'Impossible de charger les données');
  } finally {
    setIsLoading(false);
  }
};

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/conversation/${item.phoneNumber}`)}>
      <LinearGradient
        colors={colors.gradients.surface}
        style={styles.conversationItem}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient colors={colors.gradients.primary} style={styles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </LinearGradient>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.phoneNumber, { color: colors.text }]}>
              {item.contactName || item.phoneNumber}
            </Text>
            <Text style={[styles.messageDate, { color: colors.textMuted }]}>
              {new Date(item.lastMessage.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[styles.lastMessage, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.lastMessage.type === 'sent' && '✓ '}
              {item.lastMessage.body}
            </Text>
            <View style={styles.messageCount}>
              <Text style={[styles.messageCountText, { color: colors.textMuted }]}>
                {item.messages.length}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            <TouchableOpacity onPress={requestPermissions} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradients.primary} style={styles.button}>
                <Ionicons name="lock-open" size={20} color="#fff" />
                <Text style={styles.buttonText}>Autoriser l'accès aux SMS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.conversationsContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Conversations
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
              </Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                  Chargement des conversations...
                </Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.phoneNumber}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
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
  conversationsContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phoneNumber: {
    fontSize: 17,
    fontWeight: '700',
  },
  messageDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  messageCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  messageCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
