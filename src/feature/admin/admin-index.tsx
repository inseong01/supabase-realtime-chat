import { useContext, useEffect, useRef, type RefObject } from 'react';

import { ADMIN_ID, type MessageMetaData } from '../../util/const/const';
import { UserIDContextContext } from '../../util/context/global';

import { AdminDispatchContext, AdminReducerStateContext } from './context';
import { getDateTime } from './function/get-time';

import styles from './admin-index.module.css';
import ChatHeader from '../../components/chat/header/heaer-index';
import ChatBody from '../../components/chat/body/body-index';
import ChatFooter from '../../components/chat/footer/footer-index';

export default function AdminChatMode() {
  return (
    <>
      {/* 채팅방 */}
      <ChatHome />
    </>
  );
}

function ChatHome() {
  const state = useContext(AdminReducerStateContext);
  const chatRoomRef = useRef<HTMLDivElement>(null);

  const isRoomClicked = state.isRoomClicked;
  const userList = state.userList;

  const userIdArr = Object.keys(userList);

  return (
    <UserIDContextContext.Provider value={ADMIN_ID}>
      <div ref={chatRoomRef} className={`${styles.chat} ${!isRoomClicked ? styles.pb : ''}`}>
        {isRoomClicked ? (
          <ChatRoomDisplay ref={chatRoomRef} />
        ) : (
          <>
            {/* 헤더 */}
            <div className={styles.header}>
              {/* 제목 */}
              <div className={styles.titleBox}>
                <span className={styles.title}>접속인원</span>
              </div>
            </div>

            {/* 메인 */}
            <ul className={styles.onlineList}>
              {userIdArr.map((id) => {
                return <OnlineUser key={id} id={id} />;
              })}
            </ul>
          </>
        )}
      </div>
    </UserIDContextContext.Provider>
  );
}

function OnlineUser({ id }: { id: MessageMetaData['payload']['id'] }) {
  const state = useContext(AdminReducerStateContext);
  const reducer = useContext(AdminDispatchContext);

  const user = state.userList[id];
  const isTyping = user.isTyping;
  const isOnline = user.isOnline;
  const messages = user.messages;
  const latestMessage = messages.at(-1);

  const name = user.userName;
  const status = isOnline ? '온라인' : '오프라인';
  const text = latestMessage?.payload.text ?? ' ';
  const sent_at = latestMessage ? getDateTime('time', new Date(latestMessage.payload.sent_at)) : '';
  const userStatusOrSentAt = isOnline ? (!latestMessage ? status : sent_at) : status;

  const messagesLength = messages.filter((msg) => !msg.payload.isRead).length;
  const isMessagesAboveLimit = messagesLength > 9;
  const count = isMessagesAboveLimit ? '9+' : messagesLength;

  /* 채팅방 열기 */
  const onClickOpenBtn = () => {
    if (!latestMessage) return;
    if (!reducer) return;

    reducer({ type: 'OPEN_CHAT', id });
    reducer({ type: 'READ_USER_MESSAGE', id });
  };

  return (
    <li className={styles.list} onClick={onClickOpenBtn}>
      <div className={styles.top}>
        {/* 사용자 이름 */}
        <span className={styles.name}>{name}</span>

        {/* 사용자 상태 및 수신 시간 */}
        <span>{userStatusOrSentAt}</span>
      </div>
      <div className={styles.bottom}>
        {/* 메시지 미리보기 */}
        <span className={styles.text}>{isTyping ? '작성중..' : text}</span>

        {/* 안 읽은 메시지 개수 */}
        {messagesLength > 0 && <span className={styles.count}>{count}</span>}
      </div>
    </li>
  );
}

function ChatRoomDisplay({ ref }: { ref: RefObject<HTMLDivElement | null> }) {
  const state = useContext(AdminReducerStateContext);
  const reducer = useContext(AdminDispatchContext);

  const selectedID = state.selectedID;
  const messages = state.userList[selectedID].messages;
  const isTyping = state.userList[selectedID].isTyping;
  const isOnline = state.userList[selectedID].isOnline;
  const userName = state.userList[selectedID].userName;
  const currentChatRoomMessage = state.userList[selectedID].messages;
  const status = isOnline ? '온라인' : '오프라인';

  /* 메시지 창 위치 조절 */
  useEffect(() => {
    if (!ref.current) return;

    const chatRoomHeight = ref.current.scrollHeight;
    ref.current.scrollTo(0, chatRoomHeight);
  }, [ref, currentChatRoomMessage, isTyping]);

  /* 윈도우 포커스 여부 */
  useEffect(() => {
    if (!reducer) return;
    reducer({ type: 'READ_USER_MESSAGE', id: selectedID });

    function readMessagesIfVisible() {
      if (!reducer) return;
      if (document.visibilityState === 'visible') {
        reducer({ type: 'READ_USER_MESSAGE', id: selectedID });
      }
    }

    window.addEventListener('visibilitychange', readMessagesIfVisible);

    return () => {
      window.removeEventListener('visibilitychange', readMessagesIfVisible);
    };
  }, [reducer, selectedID]);

  return (
    <>
      {/* 헤더 */}
      <ChatHeader enableBack={true} chatroomTitle={userName} opponentType={`방문자`} opponentStatus={status} />

      {/* 메인 */}
      <ChatBody messages={messages} isOpponentTyping={isTyping} />

      {/* 푸터 */}
      <ChatFooter id={ADMIN_ID} receiver_id={selectedID} isOpponentOnline={isOnline} />
    </>
  );
}
