import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAllSMS, SMS, getAllContacts, findContactName } from '@/utils/smsReader';
import { createConversationStyles } from '@/assets/styles/conversations.styles';

// Type pour un item qui peut être un message ou un séparateur
type ListItem = 
  | { type: 'message'; data: SMS }
  | { type: 'separator'; date: string };

export default function ConversationScreen() {
  const { colors } = useTheme();
  const conversationStyles = createConversationStyles(colors);
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
      conversationMessages.sort((a, b) => b.date - a.date); // Plus récent en premier

      // Créer la liste avec séparateurs de date
      const items: ListItem[] = [];
      let lastDate = '';

      conversationMessages.forEach((msg) => {
        const msgDate = new Date(msg.date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        // Ajouter d'abord le message
        items.push({ type: 'message', data: msg });

        // Si la date change, ajouter un séparateur APRÈS
        if (msgDate !== lastDate) {
          items.push({ type: 'separator', date: msgDate });
          lastDate = msgDate;
        }
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
        <View style={conversationStyles.dateSeparator}>
          <View style={conversationStyles.separatorLine} />
          <Text style={conversationStyles.dateText}>
            {item.date}
          </Text>
          <View style={conversationStyles.separatorLine} />
        </View>
      );
    }

    // C'est un message
    const msg = item.data;
    const isSent = msg.type === 'sent';

    return (
      <View style={[
        conversationStyles.messageContainer,
        isSent ? conversationStyles.sentContainer : conversationStyles.receivedContainer
      ]}>
        <LinearGradient
          colors={isSent ? ['#004ff6', '#0066ff'] : ['#f6a700', '#ff9500']}
          style={[
            conversationStyles.messageBubble,
            isSent ? conversationStyles.sentBubble : conversationStyles.receivedBubble
          ]}
        >
          <Text style={conversationStyles.messageText}>{msg.body}</Text>
          <Text style={conversationStyles.messageTime}>
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
    <LinearGradient colors={colors.gradients.background} style={conversationStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={conversationStyles.safeArea} edges={['top']}>
        <View style={conversationStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={conversationStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={conversationStyles.headerContent}>
            <Text style={conversationStyles.headerTitle}>
              {contactName || phoneNumber}
            </Text>
            {contactName && (
              <Text style={conversationStyles.headerSubtitle}>
                {phoneNumber}
              </Text>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={conversationStyles.loadingContainer}>
            <Text style={conversationStyles.loadingText}>
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
            contentContainerStyle={conversationStyles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
