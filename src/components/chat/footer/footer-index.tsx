import { useState, type ChangeEvent } from 'react';

import { supabase } from '../../../util/supabase/supabase-client';
import type { MessageMetaData } from '../../../util/const/const';

import ICON_SENT from './../../../assets/icon-sent.svg';

import styles from './footer-index.module.css';

export default function ChatFooter({
  id,
  receiver_id,
  isOpponentOnline,
}: {
  id: string;
  receiver_id: string;
  isOpponentOnline: boolean;
}) {
  const [text, typingText] = useState('');

  const MY_CHANNEL = supabase.channel('channel_1', {
    config: {
      broadcast: { self: true },
    },
  });

  /* 메시지 전송 */
  async function onClickSendMessage() {
    if (!text.length) return;

    const sent_at = new Date().toISOString();

    const msgData: MessageMetaData = {
      type: 'broadcast',
      event: 'send',
      payload: { text: text, isTyping: false, id, sent_at, receiver_id },
    };

    const updatedOpponentState: MessageMetaData = {
      type: 'broadcast',
      event: 'opponent',
      payload: { text: '', isTyping: false, id, sent_at },
    };

    Promise.all([MY_CHANNEL.send(msgData), MY_CHANNEL.send(updatedOpponentState)]).catch((err) => {
      console.error('Error sending messages: ', err);
    });

    typingText('');
  }

  /* 메시지 작성 */
  function onChangeTypingWords(e: ChangeEvent<HTMLInputElement>) {
    typingText(e.target.value);

    const sent_at = new Date().toISOString();
    const isTyping = e.target.value.length !== 0;

    const updatedOpponentState: MessageMetaData = {
      type: 'broadcast',
      event: 'opponent',
      payload: { text: '', isTyping, id, sent_at, receiver_id },
    };

    MY_CHANNEL.send(updatedOpponentState).then((res) => console.log(res));
  }

  return (
    <div className={styles.footer}>
      <div className={styles.inputBox}>
        <input
          type='text'
          className={styles.input}
          onChange={onChangeTypingWords}
          value={text}
          disabled={!isOpponentOnline}
          placeholder={isOpponentOnline ? '내용을 입력해주세요' : '메시지를 보낼 수 없습니다.'}
        />

        <button
          type='button'
          role='button'
          className={styles.sendBtn}
          onClick={onClickSendMessage}
          disabled={!isOpponentOnline}
          title='전송'
          aria-label='전송'
        >
          <img src={ICON_SENT} className={styles.icon} alt='전송' />
        </button>
      </div>
    </div>
  );
}
