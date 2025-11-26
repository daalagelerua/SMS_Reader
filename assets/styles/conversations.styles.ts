import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const createConversationStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    // Container principal
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },

    // Header de la conversation
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      fontWeight: '500',
      marginTop: 2,
      color: colors.textMuted,
    },

    // Liste des messages
    messagesList: {
      padding: 16,
      paddingBottom: 100,
    },

    // Séparateur de date
    dateSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dateText: {
      fontSize: 13,
      fontWeight: '600',
      paddingHorizontal: 12,
      color: colors.textMuted,
    },

    // Container de message
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

    // Bulle de message
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

    // État de chargement
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textMuted,
    },
  });

  return styles;
};
