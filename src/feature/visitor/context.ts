import { createContext, type Dispatch, type SetStateAction } from 'react';

import { initOpponentState, type MessageMetaData } from '../../util/const/const';

export const UserIDContextContext = createContext('');

export const OpponentStateContext = createContext(initOpponentState);

type GetMessageContext = Dispatch<SetStateAction<MessageMetaData[]>>;
export const GetMessageContext = createContext<GetMessageContext | undefined>(undefined);
