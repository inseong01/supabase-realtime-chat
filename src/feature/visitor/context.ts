import { createContext } from 'react';

import { initOpponentState } from '../../util/const/const';

import { initVisitorAppState, type InitVisitorAppState } from './reducer';

export const OpponentStateContext = createContext(initOpponentState);

type VisitorReducerStateContext = InitVisitorAppState;
export const VisitorReducerStateContext = createContext<VisitorReducerStateContext>(initVisitorAppState);
