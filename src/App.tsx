import { useEffect, useReducer, useRef, useState } from 'react';

import { SetIconClickContext, UserIDContextContext } from './util/context/global';
import { ADMIN_ID, NICK_NAME, USER_ID, type CustomPresence, type MessageMetaData } from './util/const/const';
import { supabase } from './util/supabase/supabase-client';

import { adminReducer, initAdminAppState } from './feature/admin/reducer';
import { AdminDispatchContext, AdminReducerStateContext } from './feature/admin/context';
import { initVisitorAppState, visitorReducer } from './feature/visitor/reducer';
import { VisitorDispatchContext, VisitorReducerStateContext } from './feature/visitor/context';

import './App.css';
import AdminChatMode from './feature/admin/admin-index';
import VisitorChatMode from './feature/visitor/visitor-index';
import ChattingAppIcon from './components/icon/icon-index';

function App() {
  const [isLogin] = useState(false);
  const [isIconClicked, setIconClick] = useState(false);

  const [visitorState, visitorDispatch] = useReducer(visitorReducer, initVisitorAppState);
  const [adminState, adminDispatch] = useReducer(adminReducer, initAdminAppState);

  const isAppOpenedRef = useRef(isIconClicked);

  const localStorageID = localStorage.getItem('user_id');
  const localStorageNickName = localStorage.getItem('user_name');
  const ID = isLogin ? ADMIN_ID : localStorageID ?? USER_ID;
  const NAME = isLogin ? 'ADMIN' : localStorageNickName ?? NICK_NAME;

  useEffect(() => {
    isAppOpenedRef.current = isIconClicked;
  }, [isIconClicked]);

  useEffect(() => {
    const userStatus: CustomPresence = {
      userID: ID,
      userName: NAME,
      online_at: new Date().toISOString(),
      isOnline: true,
      isTyping: false,
      messages: [],
    };

    const MY_CHANNEL = supabase
      /* 채팅방 설정 */
      .channel('channel_1', {
        config: {
          presence: { key: ID },
          broadcast: {
            self: true,
          },
        },
      });

    if (isLogin) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');

      MY_CHANNEL
        /* 데이터 송수신 */
        .on('broadcast', { event: 'send' }, (data) => {
          const isAppOpened = isAppOpenedRef.current;

          adminDispatch({ type: 'GET_MESSAGE', data: data as MessageMetaData, isAppOpened });
        })
        .on('broadcast', { event: 'opponent' }, (data) => {
          const id: string = data.payload.id;
          const isMyself = id === ADMIN_ID;

          if (isMyself) return;

          const isTyping: boolean = data.payload.isTyping;
          const userData = { isTyping: isTyping, id: id };

          adminDispatch({ type: 'SET_USER_MESSAGE_STATE', data: userData });
        });

      MY_CHANNEL
        /* 채팅방 연결 */
        .on('presence', { event: 'sync' }, () => {
          const presenceState = MY_CHANNEL.presenceState<CustomPresence>();
          const myID = ADMIN_ID;

          adminDispatch({ type: 'ADD_USER_LIST', list: presenceState, myID }); // 렌더링 2~3회 유발
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          if (key === ADMIN_ID) return;

          adminDispatch({ type: 'UPDATE_USER_OFFLINE', key });
        });

      MY_CHANNEL
        /* 사용자 추적 설정 */
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;

          await MY_CHANNEL.track(userStatus);
        });
    } else {
      localStorage.setItem('user_id', ID);
      localStorage.setItem('user_name', NAME);

      MY_CHANNEL
        /* 데이터 송수신 */
        .on('broadcast', { event: 'send' }, (data) => {
          const myID = ID;
          const isAppOpened = isAppOpenedRef.current;

          visitorDispatch({ type: 'GET_MESSAGE', data: data as MessageMetaData, myID, isAppOpened });
        })
        .on('broadcast', { event: 'opponent' }, (data) => {
          const adminID = ADMIN_ID;

          visitorDispatch({ type: 'UPDATE_ADMIN_TYPING_STATUS', data: data as MessageMetaData, adminID });
        });

      MY_CHANNEL
        /* 채팅방 연결 */
        .on('presence', { event: 'join' }, ({ key }) => {
          const adminID = ADMIN_ID;
          const myID = ID;
          const isOnline = true;

          visitorDispatch({ type: 'UPDATE_ADMIN_ONLINE_STATUS', key, adminID, myID, isOnline });
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          const adminID = ADMIN_ID;
          const myID = ID;
          const isOnline = false;

          visitorDispatch({ type: 'UPDATE_ADMIN_ONLINE_STATUS', key, adminID, myID, isOnline });
        });

      MY_CHANNEL
        /* 사용자 추적 설정 */
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;

          await MY_CHANNEL.track(userStatus);
        });
    }

    return () => {
      MY_CHANNEL.unsubscribe();
    };
  }, [ID, NAME, isLogin]);

  const adminReceivedMsgCount = Object.keys(adminState.userList).reduce((acc, id) => {
    const userMessages = adminState.userList[id].messages;
    return acc + userMessages.filter((msg) => !msg.payload.isRead && msg.payload.id !== ADMIN_ID).length;
  }, 0);
  const visitorReceivedMsgCount = visitorState.messages.reduce((acc, msg) => {
    return acc + (!msg.payload.isRead && msg.payload.id !== ID ? 1 : 0);
  }, 0);
  const msgCountMention = isLogin
    ? adminReceivedMsgCount > 0
      ? `: 새로운 알림 ${adminReceivedMsgCount > 99 ? '99+' : adminReceivedMsgCount} 개`
      : ''
    : visitorReceivedMsgCount > 0
    ? `: 새로운 알림 ${visitorReceivedMsgCount > 99 ? '99+' : visitorReceivedMsgCount} 개`
    : '';

  const msgAlertMention = isLogin ? `채팅 관리자 ${msgCountMention}` : `채팅 ${msgCountMention}`;

  return (
    <>
      {/* HTML title */}
      <title>{msgAlertMention}</title>

      <SetIconClickContext.Provider value={setIconClick}>
        <UserIDContextContext.Provider value={ID}>
          {isIconClicked &&
            (isLogin ? (
              <AdminDispatchContext.Provider value={adminDispatch}>
                <AdminReducerStateContext.Provider value={adminState}>
                  {/* 채팅방 - 관리자 */}
                  <AdminChatMode />
                </AdminReducerStateContext.Provider>
              </AdminDispatchContext.Provider>
            ) : (
              <VisitorReducerStateContext.Provider value={visitorState}>
                <VisitorDispatchContext.Provider value={visitorDispatch}>
                  {/* 채팅방 - 방문자 */}
                  <VisitorChatMode />
                </VisitorDispatchContext.Provider>
              </VisitorReducerStateContext.Provider>
            ))}
        </UserIDContextContext.Provider>

        {/* 채팅방 아이콘 */}
        <ChattingAppIcon hasMsgAlert={msgCountMention.length > 0} />
      </SetIconClickContext.Provider>
    </>
  );
}

export default App;
