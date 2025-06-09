import { type ReactNode } from 'react';

import ICON_PROFILE from './../../../assets/icon-profile.svg';

import styles from './box-index.module.css';

export default function MessageBox({ writer, children }: { writer: string; children: ReactNode | string }) {
  return (
    <div data-writer={writer}>
      {/* 프로필 사진 */}
      {writer !== 'self' && (
        <div className={styles.profile}>
          <img src={ICON_PROFILE} alt='상대 프로필' />
        </div>
      )}

      {/* 메시지 */}
      <div className={styles.msg}>{children}</div>
    </div>
  );
}
