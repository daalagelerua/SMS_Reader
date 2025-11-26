import SmsAndroid from 'react-native-get-sms-android';
import * as Contacts from 'expo-contacts';

// Type pour un SMS
export interface SMS {
  id: string;
  address: string;      // Numéro de téléphone
  body: string;         // Texte du message
  date: number;         // Timestamp
  type: 'inbox' | 'sent'; // Reçu ou envoyé
}

// Fonction pour lire tous les SMS
export const getAllSMS = (): Promise<SMS[]> => {
  return new Promise((resolve, reject) => {
    // Configuration de la lecture
    const filter = {
      box: '', // '' = tous les messages (inbox + sent)
      maxCount: 100, // Limite à 100 messages pour commencer
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.error('Erreur lecture SMS:', fail);
        reject(fail);
      },
      (count: number, smsList: string) => {
        try {
          const messages = JSON.parse(smsList);
          
          // Transformer les données dans notre format
          const formattedMessages: SMS[] = messages.map((msg: any) => ({
            id: msg._id,
            address: msg.address,
            body: msg.body,
            date: parseInt(msg.date),
            type: msg.type === '1' || msg.type === 1 ? 'inbox' : 'sent',
          }));

          resolve(formattedMessages);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Interface pour une conversation
export interface Conversation {
  phoneNumber: string;
  contactName: string | null;
  messages: SMS[];
  lastMessage: SMS;
  unreadCount: number;
}

// Fonction pour normaliser les numéros
const normalizePhoneNumber = (number: string): string => {
  // Enlève tout sauf les chiffres
  let cleaned = number.replace(/\D/g, '');
  
  // Si commence par 0033, remplace par 33
  if (cleaned.startsWith('0033')) {
    cleaned = cleaned.substring(2);
  }
  
  // Si commence par 00, enlève
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // Si commence par 0 et pas 00, remplace par 33 (France)
  if (cleaned.startsWith('0') && !cleaned.startsWith('00')) {
    cleaned = '33' + cleaned.substring(1);
  }
  
  return cleaned;
};

// Fonction pour organiser les SMS en conversations
export const organizeByConversation = (
  messages: SMS[],
  contacts: Contact[] = []
): Conversation[] => {
  const grouped: { [normalizedNumber: string]: SMS[] } = {};

  // Grouper par numéro normalisé
  messages.forEach((msg) => {
    const normalized = normalizePhoneNumber(msg.address);
    if (!grouped[normalized]) {
      grouped[normalized] = [];
    }
    grouped[normalized].push(msg);
  });

  const conversations: Conversation[] = Object.keys(grouped).map((normalizedNumber) => {
    const msgs = grouped[normalizedNumber];
    msgs.sort((a, b) => b.date - a.date);

    // Utiliser l'adresse du message le plus récent comme phoneNumber d'affichage
    const displayNumber = msgs[0].address;

    return {
      phoneNumber: displayNumber,
      contactName: findContactName(normalizedNumber, contacts),
      messages: msgs,
      lastMessage: msgs[0],
      unreadCount: 0,
    };
  });

  conversations.sort((a, b) => b.lastMessage.date - a.lastMessage.date);

  return conversations;
};

// Interface pour un contact
export interface Contact {
  id: string;
  name: string;
  phoneNumbers: string[];
}

// Fonction pour lire tous les contacts
export const getAllContacts = async (): Promise<Contact[]> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission contacts refusée');
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    // Transformer au format qu'on veut
    const contacts: Contact[] = data
      .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
      .map(contact => ({
        id: contact.id || '',
        name: contact.name || 'Sans nom',
        phoneNumbers: contact.phoneNumbers!.map(pn => normalizePhoneNumber(pn.number || '')),
      }));

    return contacts;
  } catch (error) {
    console.error('Erreur lecture contacts:', error);
    return [];
  }
};

// Fonction pour trouver le nom d'un contact
export const findContactName = (phoneNumber: string, contacts: Contact[]): string | null => {
  const normalized = normalizePhoneNumber(phoneNumber);
  console.log('Recherche contact pour:', phoneNumber, '→ normalisé:', normalized);
  
  for (const contact of contacts) {
    for (const contactNumber of contact.phoneNumbers) {
      const normalizedContact = normalizePhoneNumber(contactNumber);
      
      // Compare les 9 derniers chiffres (numéro sans indicatif)
      const last9SMS = normalized.slice(-9);
      const last9Contact = normalizedContact.slice(-9);
      
      if (last9SMS === last9Contact) {
        console.log('Trouvé:', contact.name, '(', contactNumber, '→', normalizedContact, ')');
        return contact.name;
      }
    }
  }
  
  console.log('Contact non trouvé');
  return null;
};
