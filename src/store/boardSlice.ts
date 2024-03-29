import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { RootState, TypedThunkAPI } from './store';
import { IBoard, IBoardResponse } from '../types/boardTypes';
import { boardService } from '../api/boardService';
import { closeModalWindow } from './modalSlice';
import { hideLoader, showLoader } from './loaderSlice';
import { redirect } from './redirectSlice';
import { AppRoutes } from '../constants/routes';

interface IBoardState {
  boards: IBoardResponse[];
  currentBoard: IBoardResponse;
  isLoading: boolean;
  currentPageNum: number;
}

const initialState: IBoardState = {
  isLoading: false,
  boards: [],
  currentBoard: { users: [], owner: '', title: '', _id: '' },
  currentPageNum: 1,
};

export const addNewBoard = createAsyncThunk<IBoardResponse, IBoard, TypedThunkAPI>(
  'board/addNewBoard',
  async (data: IBoard, { rejectWithValue, getState, dispatch }) => {
    try {
      const { userId } = getState().authStore;
      data.users = [userId];
      const response = await boardService.addNewBoard(data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(closeModalWindow());
    }
  }
);

export const getAllBoards = createAsyncThunk<IBoardResponse[], void, TypedThunkAPI>(
  'board/getAllBoards',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader());
      const response = await boardService.getAllBoards();
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(hideLoader());
    }
  }
);

export const getBoard = createAsyncThunk<IBoardResponse, string, TypedThunkAPI>(
  'board/getBoard',
  async (_id, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader());
      const response = await boardService.getBoard(_id);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(hideLoader());
    }
  }
);

export const deleteBoard = createAsyncThunk<IBoardResponse, void, TypedThunkAPI>(
  'board/deleteBoard',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { _id } = getState().boardStore.currentBoard;
      const response = await boardService.deleteBoard(_id);

      if (response.status === 200) {
        dispatch(redirect(AppRoutes.BOARDS));
      }

      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(closeModalWindow());
    }
  }
);

export const editBoard = createAsyncThunk<IBoardResponse, IBoard, TypedThunkAPI>(
  'board/editBoard',
  async (board, { rejectWithValue, getState, dispatch }) => {
    try {
      const { _id, users } = getState().boardStore.currentBoard;
      const data = { ...board, users };
      const response = await boardService.editBoard(_id, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(closeModalWindow());
    }
  }
);

const boardSlice = createSlice({
  name: 'Board',
  initialState,
  reducers: {
    setCurrentBoard(state: IBoardState, action) {
      state.currentBoard = action.payload;
    },
    setCurrentPageNum(state: IBoardState, action) {
      state.currentPageNum = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNewBoard.fulfilled, (state, { payload: board }) => {
      state.boards = [...state.boards, board];
    });
    builder.addCase(getBoard.fulfilled, (state, { payload: board }) => {
      state.currentBoard = board;
    });
    builder.addCase(getAllBoards.fulfilled, (state, { payload: boards }) => {
      state.boards = boards;
    });
    builder.addCase(deleteBoard.fulfilled, (state, { payload: board }) => {
      state.boards = state.boards.filter((boardState) => boardState._id !== board._id);
      state.currentBoard = initialState.currentBoard;
      console.log(initialState.currentBoard);
    });
    builder.addCase(editBoard.fulfilled, (state, { payload: board }) => {
      state.boards = state.boards.map((boardState) => {
        if (boardState._id === board._id) {
          boardState.title = board.title;
          boardState.owner = board.owner;
        }
        return boardState;
      });
    });
  },
});

export const { setCurrentBoard, setCurrentPageNum } = boardSlice.actions;

export const boardReducer = boardSlice.reducer;

export const boardSelector = (state: RootState): IBoardState => state.boardStore;

export const currentBoardSelector = (state: RootState): IBoardResponse =>
  state.boardStore.currentBoard;
