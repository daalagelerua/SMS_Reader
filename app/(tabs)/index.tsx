import { View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { getAllSMS, organizeByConversation, Conversation, getAllContacts } from '@/utils/smsReader';
import { router } from 'expo-router';
import { createHomeStyles } from '@/assets/styles/home.styles';

export default function Index() {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const [sms, contacts] = await Promise.all([
        getAllSMS(),
        getAllContacts(),
      ]);
      
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
        style={homeStyles.conversationItem}
      >
        <View style={homeStyles.avatarContainer}>
          <LinearGradient colors={colors.gradients.primary} style={homeStyles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </LinearGradient>
        </View>

        <View style={homeStyles.conversationContent}>
          <View style={homeStyles.conversationHeader}>
            <Text style={homeStyles.phoneNumber}>
              {item.contactName || item.phoneNumber}
            </Text>
            <Text style={homeStyles.messageDate}>
              {new Date(item.lastMessage.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>

          <View style={homeStyles.conversationFooter}>
            <Text
              style={homeStyles.lastMessage}
              numberOfLines={1}
            >
              {item.lastMessage.type === 'sent' && '✓ '}
              {item.lastMessage.body}
            </Text>
            <View style={homeStyles.messageCount}>
              <Text style={homeStyles.messageCountText}>
                {item.messages.length}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={colors.gradients.background} style={homeStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        {!hasPermission ? (
          <View style={homeStyles.content}>
            <Ionicons name="chatbubbles" size={80} color={colors.primary} />
            <Text style={homeStyles.title}>SMS Reader</Text>
            <Text style={homeStyles.subtitle}>
              Pour commencer, autorisez l'accès aux SMS
            </Text>
            <TouchableOpacity onPress={requestPermissions} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradients.primary} style={homeStyles.button}>
                <Ionicons name="lock-open" size={20} color="#fff" />
                <Text style={homeStyles.buttonText}>Autoriser l'accès aux SMS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={homeStyles.conversationsContainer}>
            <View style={homeStyles.header}>
              <Text style={homeStyles.headerTitle}>
                Conversations
              </Text>
              <Text style={homeStyles.headerSubtitle}>
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
              </Text>
            </View>

            {isLoading ? (
              <View style={homeStyles.loadingContainer}>
                <Text style={homeStyles.loadingText}>
                  Chargement des conversations...
                </Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.phoneNumber}
                contentContainerStyle={homeStyles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
