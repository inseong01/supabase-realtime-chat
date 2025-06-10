import { useEffect, useReducer, useState } from 'react';

import { SetIconClickContext, UserIDContextContext } from './util/context/global';
import { ADMIN_ID, USER_ID, type CustomPresence, type MessageMetaData } from './util/const/const';

import { adminReducer, initAdminAppState } from './feature/admin/reducer';
import { AdminDispatchContext, AdminReducerStateContext } from './feature/admin/context';
import { initVisitorAppState, visitorReducer } from './feature/visitor/reducer';
import { VisitorReducerStateContext } from './feature/visitor/context';

import './App.css';
import AdminChatMode from './feature/admin/admin-index';
import VisitorChatMode from './feature/visitor/visitor-index';
import ChattingAppIcon from './components/icon/icon-index';
import { supabase } from './util/supabase/supabase-client';

function App() {
  const [isLogin, setLogin] = useState(false);
  const [isIconClicked, setIconClick] = useState(false);

  const [visitorState, visitorDispatch] = useReducer(visitorReducer, initVisitorAppState);
  const [adminState, adminDispatch] = useReducer(adminReducer, initAdminAppState);

  const localStorageID = localStorage.getItem('user_id');
  const ID = isLogin ? ADMIN_ID : localStorageID ?? USER_ID;

  useEffect(() => {
    const userStatus: CustomPresence = {
      userID: ID,
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

      MY_CHANNEL
        /* 데이터 송수신 */
        .on('broadcast', { event: 'send' }, (data) => {
          console.log('data: ', data);

          adminDispatch({ type: 'GET_MESSAGE', data: data as MessageMetaData });
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

      MY_CHANNEL
        /* 데이터 송수신 */
        .on('broadcast', { event: 'send' }, (data) => {
          const myID = ID;

          visitorDispatch({ type: 'GET_MESSAGE', data: data as MessageMetaData, myID });
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
  }, [ID, isLogin]);

  const adminReceivedMsgCount = Object.keys(adminState.userList).reduce((acc, key) => {
    const userMessages = adminState.userList[key].messages;
    const notReadMessages = userMessages.filter((msg) => !msg.payload.isRead && msg.payload.id !== ADMIN_ID);
    return notReadMessages.length + acc;
  }, 0);
  const visitorReceivedMsgCount = visitorState.messages.reduce((acc, msg) => {
    const isRead = !msg.payload.isRead && msg.payload.id !== ID;
    return isRead ? acc + 1 : acc;
  }, 0);
  const msgCountMention = isLogin
    ? adminReceivedMsgCount > 0
      ? `: 새로운 알림 ${adminReceivedMsgCount} 개`
      : ''
    : visitorReceivedMsgCount > 0
    ? `: 새로운 알림 ${visitorReceivedMsgCount} 개`
    : '';

  const msgCountAlertMention = isLogin ? `채팅 관리자 ${msgCountMention}` : `채팅 ${msgCountMention}`;

  /*
    알림 수신 개수 점검, 읽음 처리, 스타일링 필요
  */

  return (
    <>
      {/* HTML title */}
      <title>{msgCountAlertMention}</title>

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
                {/* 채팅방 - 방문자 */}
                <VisitorChatMode />
              </VisitorReducerStateContext.Provider>
            ))}
        </UserIDContextContext.Provider>

        {/* 채팅방 아이콘 */}
        <ChattingAppIcon />
      </SetIconClickContext.Provider>
    </>
  );
}

export default App;
