import { createSlice } from '@reduxjs/toolkit';
import { FulfilledAction, PendingAction, RejectedAction, RootState } from './store';
import { FULFILLED, PENDING, REJECTED } from '../constants/asyncThunk';
import {
  isAddAction,
  isBoardAction,
  isColumnAction,
  isDeleteAction,
  isDoneAction,
  isEditAction,
  isNotDoneAction,
  isSignAction,
  isSignInAction,
  isSignUpAction,
  isTaskAction,
  isUserAction,
} from './utils';

export type IAlertType = ALERT.INFO | ALERT.SUCCESS | ALERT.ERROR;

export interface IAlertContent {
  type: IAlertType;
  message: string;
}

export type IAlertState = {
  isShow: boolean;
  timeout: 2000;
  content: IAlertContent;
};

export enum ALERT {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

const initialState: IAlertState = {
  isShow: false,
  timeout: 2000,
  content: {
    message: '',
    type: ALERT.SUCCESS,
  },
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    closeAlert(state: IAlertState) {
      state.isShow = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is PendingAction => action.type.endsWith(PENDING),
      (state) => {
        state.isShow = false;
      }
    );
    builder.addMatcher(
      (action): action is FulfilledAction => action.type.endsWith(FULFILLED),
      (state, action) => {
        const content = {
          type: ALERT.SUCCESS,
          message: '',
        };
        if (isDeleteAction(action)) {
          state.isShow = true;
          if (isBoardAction(action)) content.message = 'delete.board';
          if (isColumnAction(action)) content.message = 'delete.column';
          if (isTaskAction(action)) content.message = 'delete.task';
          if (isUserAction(action)) content.message = 'delete.user';
        }
        if (isAddAction(action)) {
          state.isShow = true;
          if (isBoardAction(action)) content.message = 'add.board';
          if (isColumnAction(action)) content.message = 'add.column';
          if (isTaskAction(action)) content.message = 'add.task';
        }
        if (isEditAction(action)) {
          state.isShow = true;
          if (isBoardAction(action)) content.message = 'edit.board';
          if (isColumnAction(action)) content.message = 'edit.column';
          if (isTaskAction(action)) content.message = 'edit.task';
          if (isUserAction(action)) content.message = 'edit.user';
        }
        if (isDoneAction(action)) {
          state.isShow = true;
          if (isTaskAction(action)) content.message = 'done.task.done';
        }
        if (isNotDoneAction(action)) {
          state.isShow = true;
          if (isTaskAction(action)) content.message = 'done.task.notDone';
        }
        if (isSignAction(action)) {
          state.isShow = true;
          if (isSignUpAction(action)) content.message = 'sign.up';
          if (isSignInAction(action)) content.message = 'sign.in';
        }
        state.content = { ...content };
      }
    );
    builder.addMatcher(
      (action): action is RejectedAction => action.type.endsWith(REJECTED),
      (state, action) => {
        const content = {
          type: ALERT.ERROR,
          message: '',
        };
        if (isAddAction(action)) {
          state.isShow = true;
          content.message = 'add.error';
        }
        if (isDeleteAction(action)) {
          state.isShow = true;
          content.message = 'delete.error';
        }
        if (isEditAction(action)) {
          state.isShow = true;
          content.message = 'edit.error';
        }
        state.content = { ...content };
      }
    );
  },
});

export const alertReducer = alertSlice.reducer;
export const { closeAlert } = alertSlice.actions;

export const alertSelector = (state: RootState): IAlertState => state.alertStore;
