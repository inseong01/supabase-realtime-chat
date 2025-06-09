import { useState } from 'react';

import { SetIconClickContext } from './util/context/global';

import './App.css';
import AdminChatMode from './feature/admin/admin-index';
import VisitorChatMode from './feature/visitor/visitor-index';
import ChattingAppIcon from './components/icon/icon-index';

function App() {
  const [isLogin, setLogin] = useState(false);
  const [isIconClicked, setIconClick] = useState(false);

  return (
    <>
      <SetIconClickContext.Provider value={setIconClick}>
        {/* 채팅방 */}
        {isIconClicked && (!isLogin ? <AdminChatMode /> : <VisitorChatMode />)}

        {/* 채팅방 아이콘 */}
        <ChattingAppIcon />
      </SetIconClickContext.Provider>
    </>
  );
}

export default App;
