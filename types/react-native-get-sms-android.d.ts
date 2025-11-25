declare module 'react-native-get-sms-android' {
  export interface SmsFilter {
    box?: string;
    maxCount?: number;
    indexFrom?: number;
    read?: number;
    address?: string;
  }

  export interface SmsMessage {
    _id: string;
    address: string;
    body: string;
    date: string;
    type: string;
    read: string;
  }

  const SmsAndroid: {
    list: (
      filter: string,
      fail: (error: string) => void,
      success: (count: number, smsList: string) => void
    ) => void;
    
    autoSend: (
      phoneNumber: string,
      message: string,
      fail: (error: string) => void,
      success: () => void
    ) => void;
  };

  export default SmsAndroid;
}
