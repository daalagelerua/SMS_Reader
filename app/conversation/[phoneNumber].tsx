import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAllSMS, SMS, getAllContacts, findContactName } from '@/utils/smsReader';

// Type pour un item qui peut être un message ou un séparateur
type ListItem = 
  | { type: 'message'; data: SMS }
  | { type: 'separator'; date: string };

export default function ConversationScreen() {
  const { colors } = useTheme();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [contactName, setContactName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversation();
  }, []);

  const loadConversation = async () => {
    try {
      const allSMS = await getAllSMS();
      const conversationMessages = allSMS.filter(
        (msg) => msg.address === phoneNumber
      );
      conversationMessages.sort((a, b) => a.date - b.date);

      // Créer la liste avec séparateurs de date
      const items: ListItem[] = [];
      let lastDate = '';

      conversationMessages.forEach((msg) => {
        const msgDate = new Date(msg.date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        // Si la date change, ajouter un séparateur
        if (msgDate !== lastDate) {
          items.push({ type: 'separator', date: msgDate });
          lastDate = msgDate;
        }

        items.push({ type: 'message', data: msg });
      });

      setListItems(items);

      // Charger le nom du contact
      const contacts = await getAllContacts();
      const name = findContactName(phoneNumber, contacts);
      setContactName(name);
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'separator') {
      return (
        <View style={styles.dateSeparator}>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {item.date}
          </Text>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        </View>
      );
    }

    // C'est un message
    const msg = item.data;
    const isSent = msg.type === 'sent';

    return (
      <View style={[
        styles.messageContainer,
        isSent ? styles.sentContainer : styles.receivedContainer
      ]}>
        <LinearGradient
          colors={isSent ? ['#004ff6', '#0066ff'] : ['#f6a700', '#ff9500']}
          style={[styles.messageBubble, isSent ? styles.sentBubble : styles.receivedBubble]}
        >
          <Text style={styles.messageText}>{msg.body}</Text>
          <Text style={styles.messageTime}>
            {new Date(msg.date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {contactName || phoneNumber}
            </Text>
            {contactName && (
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {phoneNumber}
              </Text>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Chargement...
            </Text>
          </View>
        ) : (
          <FlatList
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => 
              item.type === 'separator' ? `sep-${index}` : `msg-${item.data.id}`
            }
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '400',
    alignSelf: 'flex-end',
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
