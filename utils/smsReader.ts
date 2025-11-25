import SmsAndroid from 'react-native-get-sms-android';

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
            type: msg.type === '1' ? 'inbox' : 'sent',
          }));

          resolve(formattedMessages);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};
