import { useContext } from 'react';

import { SetIconClickContext } from '../../../util/context/global';

import ICON_CLOSE from './../../../assets/icon-close.svg';
import ICON_BACK from './../../../assets/icon-back.svg';

import { AdminDispatchContext } from '../../../feature/admin/context';

import styles from './header-index.module.css';

export default function ChatHeader({
  chatroomTitle = '환영합니다',
  enableBack,
  opponentType,
  opponentStatus,
}: {
  chatroomTitle?: string;
  enableBack: boolean;
  opponentType: string;
  opponentStatus: string;
}) {
  const setIconClick = useContext(SetIconClickContext);
  const reducer = useContext(AdminDispatchContext);

  /* 닫기 */
  function onClickHeaderCloseIcon() {
    if (!setIconClick) {
      alert('채팅을 닫는 중 예기치 못한 오류가 발생했습니다.');
      return;
    }

    setIconClick((prev: boolean) => !prev);
  }

  /* 뒤로가기 - 관리자 */
  function onClickHeaderBackIcon() {
    if (!reducer) {
      alert('채팅을 닫는 중 예기치 못한 오류가 발생했습니다.');
      return;
    }

    reducer({ type: 'CLOSE_CHAT' });
  }

  return (
    <div className={styles.header}>
      {/* 뒤로가기 아이콘 */}
      {enableBack && (
        <button
          className={styles.backBtn}
          type='button'
          role='button'
          title='뒤로가기'
          aria-label='채팅창 뒤로가기'
          onClick={onClickHeaderBackIcon}
        >
          <img src={ICON_BACK} alt='뒤로가기' />
        </button>
      )}

      {/* 제목 */}
      <div className={styles.titleBox}>
        <span className={styles.title}>{chatroomTitle}</span>
        <span className={styles.status}>
          현재 {opponentType}는 {opponentStatus}입니다.
        </span>
      </div>

      {/* 닫기 아이콘 */}
      <button
        className={styles.closeBtn}
        type='button'
        role='button'
        title='닫기'
        aria-label='채팅창 닫기'
        onClick={onClickHeaderCloseIcon}
      >
        <img src={ICON_CLOSE} alt='닫기' />
      </button>
    </div>
  );
}
