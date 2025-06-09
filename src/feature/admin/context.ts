import { createContext, type ActionDispatch, type Dispatch, type SetStateAction } from 'react';

import type { MessageMetaData } from '../../util/const/const';
import { initAppState, type InitAppState } from './reducer';

export const initialOpponentState = { isOnline: false, isTyping: false };
export const OpponentStateContext = createContext(initialOpponentState);

type GetMessageContext = Dispatch<SetStateAction<MessageMetaData[]>>;
export const GetMessageContext = createContext<GetMessageContext | undefined>(undefined);

type DispatchContext = ActionDispatch<[action: any]>;
export const DispatchContext = createContext<DispatchContext | undefined>(undefined);

type ReducerStateContext = InitAppState;
export const ReducerStateContext = createContext<ReducerStateContext>(initAppState);
