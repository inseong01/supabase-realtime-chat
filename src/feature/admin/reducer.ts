import type { RealtimePresenceState } from '@supabase/supabase-js';

import { ADMIN_ID, type MessageMetaData, type CustomPresence } from '../../util/const/const';

export type InitAdminAppState = {
  isRoomClicked: boolean;
  userList: { [key: string]: CustomPresence };
  selectedID: MessageMetaData['payload']['id'];
};

export const initAdminAppState: InitAdminAppState = {
  isRoomClicked: false,
  userList: {},
  selectedID: '',
};

interface OpenChatAction {
  type: 'OPEN_CHAT';
  id: MessageMetaData['payload']['id'];
}

interface CloseChatAction {
  type: 'CLOSE_CHAT';
}

interface AddUserListAction {
  type: 'ADD_USER_LIST';
  list: RealtimePresenceState<CustomPresence>;
  myID: string;
}

interface RemoveUserListAction {
  type: 'UPDATE_USER_OFFLINE';
  key: string;
}

interface GetMessageAction {
  type: 'GET_MESSAGE';
  data: MessageMetaData;
  isAppOpened: boolean;
}

interface SetUserMessageStateAction {
  type: 'SET_USER_MESSAGE_STATE';
  data: {
    id: MessageMetaData['payload']['id'];
    isTyping: MessageMetaData['payload']['isTyping'];
  };
}

interface ReadUserMessageAction {
  type: 'READ_USER_MESSAGE';
  id: string;
}

export type ActionType =
  | OpenChatAction
  | CloseChatAction
  | AddUserListAction
  | RemoveUserListAction
  | GetMessageAction
  | SetUserMessageStateAction
  | ReadUserMessageAction;

export function adminReducer(state: InitAdminAppState, action: ActionType) {
  switch (action.type) {
    case 'OPEN_CHAT': {
      const selectedID = action.id;

      return {
        ...state,
        selectedID,
        isRoomClicked: true,
      };
    }
    case 'CLOSE_CHAT': {
      return {
        ...state,
        selectedID: '',
        isRoomClicked: false,
      };
    }
    case 'ADD_USER_LIST': {
      const onlineUsersList = action.list;
      const myID = action.myID;

      const filteredUserList = Object.entries(onlineUsersList)
        .filter(([key]) => key !== myID) // 본인 ID 제외
        .map(([, value]) => value[0]); // 접속 상태 값 추출 (열려있는 탭 중 첫번째 정보)

      const onlineUsersObject = Object.fromEntries(filteredUserList.map((user) => [user.userID, user]));

      return {
        ...state,
        userList: { ...state.userList, ...onlineUsersObject },
      };
    }
    case 'UPDATE_USER_OFFLINE': {
      const userID = action.key;

      return {
        ...state,
        userList: {
          ...state.userList,
          [userID]: {
            ...state.userList[userID],
            isOnline: false,
          },
        },
      };
    }
    case 'GET_MESSAGE': {
      const data = action.data.payload;
      const isAppOpened = action.isAppOpened;
      const selectedID = state.selectedID;

      const id = data.id;
      const isTyping = data.isTyping;

      const isWindowVisible = document.visibilityState === 'visible';
      const isChatVisible = isAppOpened && isWindowVisible;
      const messageReadConditions = selectedID === id || ADMIN_ID === id; // 채팅방 접속 중이거나 본인 메시지면
      const isRead = isChatVisible ? messageReadConditions : false;

      const payload = { ...data, isRead };
      const messages: MessageMetaData = { ...action.data, payload };

      /* 관리자(본인) 메시지 처리 */
      const isAdminMessage = id === ADMIN_ID;

      if (isAdminMessage) {
        const receiver_id = data.receiver_id!;
        const updatedMessageData = [...state.userList[receiver_id].messages, messages];

        return {
          ...state,
          userList: {
            ...state.userList,
            [receiver_id]: {
              ...state.userList[receiver_id],
              messages: updatedMessageData,
            },
          },
        };
      }

      return {
        ...state,
        userList: {
          ...state.userList,
          [id]: {
            ...state.userList[id],
            isTyping,
            messages: [...state.userList[id].messages, messages],
          },
        },
      };
    }
    case 'SET_USER_MESSAGE_STATE': {
      const id = action.data.id;
      const isTyping = action.data.isTyping;

      return {
        ...state,
        userList: {
          ...state.userList,
          [id]: {
            ...state.userList[id],
            isTyping,
          },
        },
      };
    }
    case 'READ_USER_MESSAGE': {
      const id = action.id;
      const readMessages = state.userList[id].messages.map((props) => ({
        ...props,
        payload: {
          ...props.payload,
          isRead: true,
        },
      }));

      return {
        ...state,
        userList: {
          ...state.userList,
          [id]: {
            ...state.userList[id],
            messages: [...readMessages],
          },
        },
      };
    }
    default: {
      throw new Error('unexpected action type');
    }
  }
}
