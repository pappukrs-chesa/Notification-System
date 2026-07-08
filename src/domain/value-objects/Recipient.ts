export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface FcmRecipient {
  tokens: string[];
}

export interface WhatsAppRecipient {
  phone: string;
}

export type Recipient = EmailRecipient | FcmRecipient | WhatsAppRecipient;
