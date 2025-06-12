import type { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import { getRandomNickname } from '@woowa-babble/random-nickname';
import { v1 as uuidv1 } from 'uuid';

export const USER_ID = uuidv1();

export const NICK_NAME = getRandomNickname('animals');

export const ADMIN_ID = '99478830-3d2d-11f0-a097-1780455c1367';

export const initOpponentState = { isAdminOnline: false, isAdminTyping: false };

export type MessageMetaData = {
  type: `${REALTIME_LISTEN_TYPES.BROADCAST}`;
  event: string;
  payload: {
    id: string;
    text: string;
    sent_at: string;
    receiver_id?: string;
    isTyping: boolean;
    isRead: boolean;
  };
};

export const initMessage: MessageMetaData = {
  type: 'broadcast',
  event: '',
  payload: {
    id: '',
    text: 'Welcome!',
    sent_at: '',
    receiver_id: '',
    isTyping: false,
    isRead: false,
  },
};

export const initMessagesArr: MessageMetaData[] = [
  {
    type: 'broadcast',
    event: '',
    payload: {
      id: '',
      text: 'Welcome!',
      sent_at: '',
      receiver_id: '',
      isTyping: false,
      isRead: false,
    },
  },
];

export type CustomPresence = {
  presence_ref?: string; // 서버서 임의 부여
  userID: string;
  userName: string;
  online_at: string;
  isOnline: boolean;
  isTyping: boolean;
  messages: MessageMetaData[];
};
