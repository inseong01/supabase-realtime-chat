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

type ActionType = GetMessageAction | UpdateAdminTypingStatusAction | UpdateAdminOnlineStatusAction;

export function visitorReducer(state: InitVisitorAppState, action: ActionType) {
  switch (action.type) {
    case 'GET_MESSAGE': {
      const MY_ID = action.myID;
      const isMySelf = action.data.payload.id === MY_ID;
      const isMyMessage = action.data.payload?.receiver_id === MY_ID;

      if (!(isMySelf || isMyMessage)) return state;

      const message = action.data;

      return {
        ...state,
        messages: [...state.messages, message],
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
