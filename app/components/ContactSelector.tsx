import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getAllContacts, Contact } from '@/utils/smsReader';
import useTheme from '@/hooks/useTheme';
import { createHomeStyles } from '@/assets/styles/home.styles';
import { router } from 'expo-router';

interface ContactWithDisplay extends Contact {
  displayNumber: string;
}

const ContactSelector = () => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const [contacts, setContacts] = useState<ContactWithDisplay[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactWithDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const allContacts = await getAllContacts();
      
      // Transformer en ContactWithDisplay - utiliser le numéro BRUT
      const contactsWithDisplay: ContactWithDisplay[] = allContacts.map(contact => {
        const rawNumber = (contact.rawPhoneNumbers && contact.rawPhoneNumbers[0]) || 
                         contact.phoneNumbers[0] || 
                         'Aucun numéro';
        
        return {
          ...contact,
          displayNumber: rawNumber
        };
      });

      // Trier alphabétiquement par nom
      contactsWithDisplay.sort((a, b) => {
        // Fonction pour détecter si c'est un nom spécial (commence par . * #)
        const isSpecialName = (name: string) => {
          const trimmed = name.trim();
          return trimmed.startsWith('.') || 
                 trimmed.startsWith('*') || 
                 trimmed.startsWith('#');
        };

        const aIsSpecial = isSpecialName(a.name);
        const bIsSpecial = isSpecialName(b.name);

        // Les noms spéciaux vont à la fin
        if (aIsSpecial && !bIsSpecial) return 1;
        if (!aIsSpecial && bIsSpecial) return -1;

        // Si les deux sont spéciaux, trier par nom
        if (aIsSpecial && bIsSpecial) {
          return a.name.localeCompare(b.name);
        }

        // Sinon tri alphabétique normal par nom
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setContacts(contactsWithDisplay);
      setFilteredContacts(contactsWithDisplay);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredContacts(contacts);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.displayNumber.includes(query)
    );
    
    setFilteredContacts(filtered);
  };

  const handleContactPress = (contact: ContactWithDisplay) => {
    // Naviguer vers la conversation avec ce numéro
    router.push(`/conversation/${contact.displayNumber}`);
  };

  const renderContact = ({ item }: { item: ContactWithDisplay }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => handleContactPress(item)}
    >
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
          <Text style={homeStyles.phoneNumber}>
            {item.name}
          </Text>
          <Text style={homeStyles.lastMessage} numberOfLines={1}>
            {item.displayNumber}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={homeStyles.loadingContainer}>
        <Text style={homeStyles.loadingText}>
          Chargement des contacts...
        </Text>
      </View>
    );
  }

  return (
    <View style={homeStyles.conversationsContainer}>
      <View style={homeStyles.header}>
        <Text style={homeStyles.headerTitle}>
          Contacts
        </Text>
        <Text style={homeStyles.headerSubtitle}>
          {filteredContacts.length} contact{filteredContacts.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={homeStyles.inputSection}>
        <View style={homeStyles.inputWrapper}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.textMuted} 
            style={{ marginRight: 12 }}
          />
          <TextInput
            style={homeStyles.input}
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des contacts */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeStyles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ContactSelector;
