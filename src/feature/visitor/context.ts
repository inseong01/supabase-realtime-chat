import { createContext, type ActionDispatch } from 'react';

import { initOpponentState } from '../../util/const/const';

import { initVisitorAppState, type InitVisitorAppState } from './reducer';

export const OpponentStateContext = createContext(initOpponentState);

type VisitorDispatchContext = ActionDispatch<[action: any]>;
export const VisitorDispatchContext = createContext<VisitorDispatchContext | undefined>(undefined);

type VisitorReducerStateContext = InitVisitorAppState;
export const VisitorReducerStateContext = createContext<VisitorReducerStateContext>(initVisitorAppState);
