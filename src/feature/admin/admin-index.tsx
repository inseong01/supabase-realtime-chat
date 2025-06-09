import { useContext, useEffect, useReducer, useRef, type RefObject } from 'react';

import { ADMIN_ID, type MessageMetaData } from '../../util/const/const';
import { supabase } from '../../util/supabase/supabase-client';

import { DispatchContext, ReducerStateContext } from './context';
import { initAppState, reducer } from './reducer';
import { getDateTime } from './function/get-time';

import styles from './admin-index.module.css';
import ChatHeader from '../../components/chat/header/heaer-index';
import ChatBody from '../../components/chat/body/body-index';
import ChatFooter from '../../components/chat/footer/footer-index';

export default function AdminChatMode() {
  const [state, dispatch] = useReducer(reducer, initAppState);

  useEffect(() => {
    const userStatus = {
      userID: ADMIN_ID,
      online_at: new Date().toISOString(),
      isOnline: true,
    };

    const MY_CHANNEL = supabase
      /* 채팅방 설정 */
      .channel('channel_1', {
        config: {
          presence: { key: ADMIN_ID },
        },
      });

    MY_CHANNEL
      /* 데이터 송수신 */
      .on('broadcast', { event: 'send' }, (data) => {
        dispatch({ type: 'GET_MESSAGE', data: data as MessageMetaData });
      })
      .on('broadcast', { event: 'opponent' }, (data) => {
        const id: string = data.payload.id;
        const isMyself = id === ADMIN_ID;

        if (isMyself) return;

        const isTyping: boolean = data.payload.isTyping;
        const userData = { isTyping: isTyping, id: id };

        dispatch({ type: 'SET_USER_MESSAGE_STATE', data: userData });
      });

    MY_CHANNEL
      /* 채팅방 연결 */
      .on('presence', { event: 'sync' }, () => {
        // const presenceState = MY_CHANNEL.presenceState();
        // const myID = ADMIN_ID;
        // dispatch({ type: 'ADD_USER_LIST', list: presenceState, myID }); // 렌더링 2~3회 유발
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === ADMIN_ID) return;
        dispatch({ type: 'REMOVE_USER_LIST', key });
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

  const sentMsgCount = Object.keys(state.userMessages).reduce((acc, curr) => {
    const userMessages = state.userMessages[curr].messages;
    const notReadMessages = userMessages.filter((msg) => !msg.isRead && msg.id !== ADMIN_ID);
    return notReadMessages.length + acc;
  }, 0);

  return (
    <DispatchContext.Provider value={dispatch}>
      <ReducerStateContext.Provider value={state}>
        {/* HTML title */}
        <title>{sentMsgCount > 0 ? '챗봇 관리자 : 새로운 알림 ' + sentMsgCount + '개' : '챗봇 관리자'}</title>

        {/* 채팅방 */}
        <ChatHome />
      </ReducerStateContext.Provider>
    </DispatchContext.Provider>
  );
}

/* 
  - userMessages: 메시지 전송한 ID 모음이 아닌 접속인원(+ 전달 메시지) 객체로 변경
  - messages: MessageMetaData 타입 포함되도록 타입 수정 필요
*/
function ChatHome() {
  const state = useContext(ReducerStateContext);

  const chatRoomRef = useRef<HTMLDivElement>(null);

  // const userMessages = {
  //   '1': {
  //     userID: '1',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '1',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: "MessageMetaData['payload']['send_at']",
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '2': {
  //     userID: '2',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '2',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '3': {
  //     userID: '3',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '3',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '4': {
  //     userID: '4',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '4',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '5': {
  //     userID: '5',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '5',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '6': {
  //     userID: '6',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '6',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '7': {
  //     userID: '7',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '7',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '8': {
  //     userID: '8',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '8',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  // };
  const isRoomClicked = state.isRoomClicked;
  const userMessages = state.userMessages;

  const userIDList = Object.keys(userMessages);

  return (
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

          {/* 바디 */}
          <ul className={styles.onlineList}>
            {userIDList.map((id) => {
              return <OnlineUser key={id} id={id} />;
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function OnlineUser({ id }: { id: MessageMetaData['payload']['id'] }) {
  const state = useContext(ReducerStateContext);
  // const userMessages = {
  //   '1': {
  //     userID: '1',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '1',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '2': {
  //     userID: '2',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '2',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '3': {
  //     userID: '3',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '3',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '4': {
  //     userID: '4',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '4',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '5': {
  //     userID: '5',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '5',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '6': {
  //     userID: '6',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '6',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '7': {
  //     userID: '7',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '7',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  //   '8': {
  //     userID: '8',
  //     isTyping: false,
  //     messages: [
  //       {
  //         id: '8',
  //         text: "MessageMetaData['payload']['text']",
  //         send_at: Date.now(),
  //         isRead: false,
  //       },
  //     ],
  //   },
  // };

  const reducer = useContext(DispatchContext);

  const selectedUserMessages = state.userMessages[id];
  // const selectedUserMessages = userMessages[id];
  const messages = selectedUserMessages.messages;
  const latestMessage = messages.at(-1);

  if (!latestMessage) return <></>;

  const name = id;
  const text = latestMessage.text;
  const sent_at = getDateTime('time', new Date(latestMessage.sent_at));

  const messagesLength = messages.filter((msg) => !msg.isRead).length;
  const isMessagesAboveLimit = messagesLength > 9;
  const count = isMessagesAboveLimit ? '9+' : messagesLength;

  /* 채팅방 열기 */
  const onClickOpenBtn = () => {
    if (!reducer) return;

    reducer({ type: 'OPEN_CHAT', id });
    reducer({ type: 'READ_USER_MESSAGE', id });
  };

  return (
    <li className={styles.list} onClick={onClickOpenBtn}>
      <div className={styles.top}>
        {/* 사용자 이름 */}
        <span className={styles.name}>{name}</span>

        {/* 마지막 수신 시간 */}
        <span>{sent_at}</span>
      </div>
      <div className={styles.bottom}>
        {/* 메시지 미리보기 */}
        <span className={styles.text}>{text}</span>

        {/* 안 읽은 메시지 개수 */}
        {messagesLength > 0 && <span className={styles.count}>{count}</span>}
      </div>
    </li>
  );
}

function ChatRoomDisplay({ ref }: { ref: RefObject<HTMLDivElement | null> }) {
  const state = useContext(ReducerStateContext);
  const reducer = useContext(DispatchContext);

  const selectedID = state.selectedID;
  const messages = state.userMessages[selectedID].messages;
  const isTyping = state.userMessages[selectedID].isTyping;
  const currentChatRoomMessage = state.userMessages[selectedID].messages;

  /* 메시지 창 위치 조절 */
  useEffect(() => {
    if (!ref.current) return;

    const chatRoomHeight = ref.current.scrollHeight;
    ref.current.scrollTo(0, chatRoomHeight);
  }, [ref, currentChatRoomMessage, isTyping]);

  /* 읽음 처리 */
  useEffect(() => {
    if (!reducer) return;

    reducer({ type: 'READ_USER_MESSAGE', id: selectedID });
  }, [reducer, selectedID]);

  return (
    <>
      {/* 헤더 */}
      <ChatHeader enableBack={true} chatroomTitle={selectedID} opponentType={`방문자`} opponentStatus={'온라인'} />

      {/* 메인 */}
      <ChatBody messages={messages} isOpponentTyping={false} />

      {/* 푸터 */}
      <ChatFooter id={ADMIN_ID} receiver_id={selectedID} isOpponentOnline={true} />
    </>
  );
}
