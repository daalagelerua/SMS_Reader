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
    // Configuration : ne PAS mettre maxCount pour éviter les limites
    const filter = {
      box: '',
      indexFrom: 0, // Commencer à 0
      // Pas de maxCount = pas de limite
    };

    console.log('🔍 Lecture SMS avec filter:', JSON.stringify(filter));

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.error('❌ Erreur lecture SMS:', fail);
        reject(fail);
      },
      (count: number, smsList: string) => {
        try {
          console.log(`📱 Total SMS retournés par Android: ${count}`);
          const messages = JSON.parse(smsList);
          console.log(`📦 Messages dans le JSON: ${messages.length}`);
          
          // Transformer les données dans notre format
          const formattedMessages: SMS[] = messages.map((msg: any) => ({
            id: msg._id,
            address: msg.address,
            body: msg.body,
            date: parseInt(msg.date),
            type: msg.type === '1' || msg.type === 1 ? 'inbox' : 'sent',
          }));

          // Trier par date pour voir l'étendue
          const sorted = [...formattedMessages].sort((a, b) => a.date - b.date);
          if (sorted.length > 0) {
            console.log(`📅 SMS le plus ancien: ${new Date(sorted[0].date).toLocaleString('fr-FR')}`);
            console.log(`📅 SMS le plus récent: ${new Date(sorted[sorted.length - 1].date).toLocaleString('fr-FR')}`);
          }

          console.log(`✅ SMS formatés: ${formattedMessages.length}`);
          resolve(formattedMessages);
        } catch (error) {
          console.error('❌ Erreur parsing:', error);
          reject(error);
        }
      }
    );
  });
};

// Fonction pour lire les SMS d'un contact spécifique
export const getSMSByContact = async (phoneNumber: string): Promise<SMS[]> => {
  console.log(`🔍 getSMSByContact appelé avec: "${phoneNumber}"`);
  
  // Charger tous les SMS
  const allSMS = await getAllSMS();
  console.log(`📱 Total SMS à filtrer: ${allSMS.length}`);
  
  // Debug: Afficher tous les numéros uniques
  const allNumbers = new Set(allSMS.map(sms => sms.address));
  console.log(`📞 Total de numéros uniques dans la base: ${allNumbers.size}`);
  if (allNumbers.size < 50) { // Si pas trop de numéros, les afficher
    console.log(`📞 Liste des numéros:`, Array.from(allNumbers));
  }
  
  // Normaliser le numéro recherché
  const normalized = phoneNumber.replace(/\D/g, '');
  const last9Digits = normalized.slice(-9);
  
  console.log(`🔢 Numéro normalisé: ${normalized}`);
  console.log(`🔢 9 derniers chiffres recherchés: ${last9Digits}`);
  
  // Trouver tous les numéros qui pourraient correspondre à ce contact
  const possibleNumbers = new Set<string>();
  allSMS.forEach((msg) => {
    const msgNormalized = msg.address.replace(/\D/g, '');
    const msgLast9 = msgNormalized.slice(-9);
    if (msgLast9 === last9Digits) {
      possibleNumbers.add(msg.address);
    }
  });
  
  console.log(`📞 Formats de numéros trouvés pour ce contact:`, Array.from(possibleNumbers));
  
  // Compteur pour le debug
  let matchCount = 0;
  
  // Filtrer par les 9 derniers chiffres
  const filtered = allSMS.filter((msg) => {
    const msgNormalized = msg.address.replace(/\D/g, '');
    const msgLast9 = msgNormalized.slice(-9);
    const matches = msgLast9 === last9Digits;
    
    // Debug: afficher les premiers messages qui matchent
    if (matches && matchCount < 5) {
      console.log(`✅ Match trouvé: ${msg.address} (${msgLast9}) - Date: ${new Date(msg.date).toLocaleString('fr-FR')}`);
      matchCount++;
    }
    
    return matches;
  });
  
  console.log(`✅ Messages filtrés pour ce contact: ${filtered.length}`);
  
  // Afficher l'étendue des dates
  if (filtered.length > 0) {
    const sorted = [...filtered].sort((a, b) => a.date - b.date);
    console.log(`📅 Plus ancien: ${new Date(sorted[0].date).toLocaleString('fr-FR')}`);
    console.log(`📅 Plus récent: ${new Date(sorted[sorted.length - 1].date).toLocaleString('fr-FR')}`);
  }
  
  return filtered;
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
  phoneNumbers: string[];        // Numéros normalisés
  rawPhoneNumbers?: string[];    // Numéros bruts (avec . * # etc)
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
        rawPhoneNumbers: contact.phoneNumbers!.map(pn => pn.number || ''),
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
