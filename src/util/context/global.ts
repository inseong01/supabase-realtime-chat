import { createContext, type Dispatch, type SetStateAction } from 'react';

type SetIconClickContext = Dispatch<SetStateAction<boolean>>;
export const SetIconClickContext = createContext<SetIconClickContext | undefined>(undefined);

export const UserIDContextContext = createContext('');
