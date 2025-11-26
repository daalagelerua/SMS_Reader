import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const createHomeStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    // Container principal
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },

    // Écran d'accueil (avant permissions)
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
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
      color: colors.textMuted,
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

    // Liste des conversations
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
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textMuted,
    },

    // Liste
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    // Item de conversation
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
      color: colors.text,
    },
    messageDate: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
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
      color: colors.textMuted,
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
      color: colors.textMuted,
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
