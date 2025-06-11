import { useContext } from 'react';

import { SetIconClickContext } from '../../util/context/global';

import ICON_FLOAT from './../../assets/icon-float.svg';

import styles from './icon-index.module.css';

export default function ChattingAppIcon({ hasMsgAlert }: { hasMsgAlert: boolean }) {
  const setIconClick = useContext(SetIconClickContext);

  function onClicAppIcon() {
    if (!setIconClick) {
      alert('채팅 실행 중 예기치 못한 오류가 발생했습니다.');
      return;
    }

    setIconClick((prev: boolean) => !prev);
  }

  return (
    <button className={styles.icon} onClick={onClicAppIcon} aria-label='채팅 아이콘'>
      {/* 메시지 수신 표시 */}
      {hasMsgAlert && <span className={styles.alertIcon}></span>}

      {/* 위젯 아이콘 */}
      <img src={ICON_FLOAT} alt='채팅 아이콘' />
    </button>
  );
}
