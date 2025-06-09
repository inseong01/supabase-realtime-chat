import type { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import { v1 as uuidv1 } from 'uuid';

export const USER_ID = uuidv1();

export const ADMIN_ID = '99478830-3d2d-11f0-a097-1780455c1367';

export const initOpponentState = { isAdminOnline: false, isAdminTyping: false };

export type MessageMetaData = {
  type: `${REALTIME_LISTEN_TYPES.BROADCAST}`;
  event: string;
  payload: {
    text: string;
    id: string;
    isTyping: boolean;
    sent_at: string;
    receiver_id?: string;
  };
};

export const initMessages: MessageMetaData[] = [
  {
    type: 'broadcast',
    event: '',
    payload: {
      text: 'Welcome!',
      id: '',
      isTyping: false,
      sent_at: '',
      receiver_id: '',
    },
  },
];
