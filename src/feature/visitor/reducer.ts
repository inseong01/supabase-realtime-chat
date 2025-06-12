import type { MessageMetaData } from '../../util/const/const';

export type InitVisitorAppState = {
  messages: MessageMetaData[];
  adminStatus: {
    isTyping: boolean;
    isOnline: boolean;
  };
};
export const initVisitorAppState: InitVisitorAppState = {
  messages: [],
  adminStatus: {
    isTyping: false,
    isOnline: false,
  },
};

interface GetMessageAction {
  type: 'GET_MESSAGE';
  data: MessageMetaData;
  myID: string;
  isAppOpened: boolean;
}

interface ReadMessageAction {
  type: 'READ_MESSAGE';
}

interface UpdateAdminTypingStatusAction {
  type: 'UPDATE_ADMIN_TYPING_STATUS';
  data: MessageMetaData;
  adminID: string;
}

interface UpdateAdminOnlineStatusAction {
  type: 'UPDATE_ADMIN_ONLINE_STATUS';
  key: string;
  adminID: string;
  myID: string;
  isOnline: boolean;
}

type ActionType = GetMessageAction | ReadMessageAction | UpdateAdminTypingStatusAction | UpdateAdminOnlineStatusAction;

export function visitorReducer(state: InitVisitorAppState, action: ActionType) {
  switch (action.type) {
    case 'GET_MESSAGE': {
      const MY_ID = action.myID;
      const isAppOpened = action.isAppOpened;
      const msgPayload = action.data.payload;

      const isNotMySelf = msgPayload.id !== MY_ID;
      const isNotMyMessage = msgPayload?.receiver_id !== MY_ID;

      if (isNotMySelf && isNotMyMessage) return state;

      const isWindowVisible = document.visibilityState === 'visible';
      const isChatVisible = isAppOpened && isWindowVisible;
      const messageReadConditions = isChatVisible || msgPayload.id === MY_ID; // 채팅이 보이거나 본인 메시지인 경우
      const isRead = messageReadConditions;

      const payload = { ...msgPayload, isRead };
      const message: MessageMetaData = { ...action.data, payload };

      return {
        ...state,
        messages: [...state.messages, message],
      };
    }
    case 'READ_MESSAGE': {
      const messages = state.messages;
      const updatedMessages: MessageMetaData[] = messages.map((msg) =>
        msg.payload.isRead ? msg : { ...msg, payload: { ...msg.payload, isRead: true } }
      );

      return {
        ...state,
        messages: updatedMessages,
      };
    }
    case 'UPDATE_ADMIN_TYPING_STATUS': {
      const data = action.data;
      const ADMIN_ID = action.adminID;
      const isAdmin = data.payload.id === ADMIN_ID;

      if (!isAdmin) return state;

      const isTyping = data.payload.isTyping;

      return {
        ...state,
        adminStatus: {
          ...state.adminStatus,
          isTyping,
        },
      };
    }
    case 'UPDATE_ADMIN_ONLINE_STATUS': {
      const ADMIN_ID = action.adminID;
      const MY_ID = action.myID;
      const key = action.key;
      const isOnline = action.isOnline;

      if (key === MY_ID) return state;
      if (key !== ADMIN_ID) return state;

      return {
        ...state,
        adminStatus: {
          ...state.adminStatus,
          isOnline,
        },
      };
    }
  }
}
