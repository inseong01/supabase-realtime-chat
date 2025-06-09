import { useContext, useEffect, useState } from 'react';

import { supabase } from '../../util/supabase/supabase-client';
import { ADMIN_ID, initMessages, initOpponentState, USER_ID, type MessageMetaData } from '../../util/const/const';

import { GetMessageContext, OpponentStateContext, UserIDContextContext } from './context';

import styles from './visitor-index.module.css';
import ChatHeader from '../../components/chat/header/heaer-index';
import ChatFooter from '../../components/chat/footer/footer-index';
import ChatBody from '../../components/chat/body/body-index';

export default function VisitorChatMode() {
  const [opponentState, setOpponentState] = useState(initOpponentState);
  const [messages, getMessage] = useState<MessageMetaData[]>(initMessages);

  const localStorageID = localStorage.getItem('user_id');
  const ID = localStorageID ?? USER_ID;

  useEffect(() => {
    localStorage.setItem('user_id', ID);

    const userStatus = {
      userID: ID,
      online_at: new Date().toISOString(),
      isOnline: true,
    };

    const MY_CHANNEL = supabase
      /* 채팅방 설정 */
      .channel('channel_1', {
        config: {
          presence: { key: ID },
        },
      });

    MY_CHANNEL
      /* 데이터 송수신 */
      .on('broadcast', { event: 'send' }, (data) => {
        const isMySelf = data.payload.id === ID;
        const isMyMessage = data.payload?.receiver_id === ID;

        if (!(isMySelf || isMyMessage)) return;

        getMessage((prev) => [...prev, data as MessageMetaData]);
      })
      .on('broadcast', { event: 'opponent' }, (data) => {
        const isAdmin = data.payload.id === ADMIN_ID;

        if (!isAdmin) return;

        const isTyping = data.payload.isTyping;
        setOpponentState((prev) => ({ ...prev, isTyping }));
      });

    MY_CHANNEL
      /* 채팅방 연결 */
      .on('presence', { event: 'sync' }, () => {})
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === ID) return;
        if (key !== ADMIN_ID) return;

        const isAdminOnline = true;
        setOpponentState((prev) => ({ ...prev, isAdminOnline }));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === ID) return;
        if (key !== ADMIN_ID) return;

        const isAdminOnline = false;
        setOpponentState((prev) => ({ ...prev, isAdminOnline }));
      });

    MY_CHANNEL
      /* 사용자 추적 설정 */
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        await MY_CHANNEL.track(userStatus);
      });

    return () => {
      MY_CHANNEL.unsubscribe();
    };
  }, []);

  return (
    <UserIDContextContext.Provider value={ID}>
      <OpponentStateContext.Provider value={opponentState}>
        <GetMessageContext.Provider value={getMessage}>
          {/* 채팅방 */}
          <ChatRoomDisplay messages={messages} />
        </GetMessageContext.Provider>
      </OpponentStateContext.Provider>
    </UserIDContextContext.Provider>
  );
}

function ChatRoomDisplay({ messages }: { messages: MessageMetaData[] }) {
  const { isAdminOnline, isAdminTyping } = useContext(OpponentStateContext);
  const USER_ID = useContext(UserIDContextContext);

  const adminStatus = isAdminOnline ? '온라인' : '오프라인';

  return (
    <div className={styles.chat}>
      {/* 헤더 */}
      <ChatHeader enableBack={false} opponentType='상담사' opponentStatus={adminStatus} />

      {/* 메인 */}
      <ChatBody messages={messages} isOpponentTyping={isAdminTyping} />

      {/* 푸터 */}
      <ChatFooter id={USER_ID} receiver_id='admin' isOpponentOnline={isAdminOnline} />
    </div>
  );
}
