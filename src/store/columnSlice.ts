import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, TypedThunkAPI } from './store';
import { hideLoader, showLoader } from './loaderSlice';
import { AxiosError } from 'axios';
import { columnService } from '../api/columnService';
import { IColumn, IColumnResponse, IColumnsSet } from '../types/columnTypes';
import { ITask, ITaskResponse, ITasksSet } from '../types/taskTypes';
import { closeModalWindow } from './modalSlice';
import { newSetColumnsOrder, reorderColumn } from '../helper/order';
import { boardService } from '../api/boardService';
import { setCurrentBoard } from './boardSlice';
import { getTaskInfoForUpdate } from '../helper/state';

interface IColumnState {
  columns: IColumnResponse[];
  currentColumn: IColumnResponse;
  currentTask: ITaskResponse;
}

const initialState: IColumnState = {
  columns: [],
  currentColumn: { _id: '', title: '', order: 0, tasks: [], boardId: '' },
  currentTask: {
    _id: '',
    title: '',
    order: 0,
    users: [],
    description: '',
    userId: '',
    boardId: '',
    columnId: '',
    isDone: false,
  },
};

export const getAllColumnsByBoard = createAsyncThunk<IColumnResponse[], string, TypedThunkAPI>(
  'column/getAllColumnsByBoard',
  async (boardId, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader());

      const response = await columnService.getAllColumnsByBoard(boardId);
      const currentBoard = await boardService.getBoard(boardId);

      dispatch(setCurrentBoard(currentBoard.data));
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

export const addNewColumn = createAsyncThunk<IColumnResponse, IColumn, TypedThunkAPI>(
  'column/addNewColumn',
  async (data: IColumn, { rejectWithValue, getState, dispatch }) => {
    try {
      const { _id } = getState().boardStore.currentBoard;
      data.order = getState().columnStore.columns.length;
      const response = await columnService.addNewColumn(_id, data);
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

export const deleteColumn = createAsyncThunk<IColumnResponse[], void, TypedThunkAPI>(
  'column/deleteColumn',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { boardId, _id } = getState().columnStore.currentColumn;
      const response = await columnService.deleteColumn(boardId, _id);
      const column = response.data;

      const state = getState().columnStore;
      const columnsList = state.columns.filter((columnState) => columnState._id !== column._id);
      const reorderColumns = reorderColumn(columnsList, 0, 0);
      const setColumns = newSetColumnsOrder(reorderColumns);
      dispatch(updateColumnsSet(setColumns));

      return reorderColumns;
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

export const editColumn = createAsyncThunk<IColumnResponse, IColumn, TypedThunkAPI>(
  'column/editColumn',
  async (column, { rejectWithValue, getState, dispatch }) => {
    try {
      const { _id, boardId, order } = getState().columnStore.currentColumn;
      column.order = order;
      const response = await columnService.editColumn(boardId, _id, column);
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

export const updateColumnsSet = createAsyncThunk<IColumnResponse[], IColumnsSet[], TypedThunkAPI>(
  'column/updateColumnsSet',
  async (data, { rejectWithValue }) => {
    try {
      const response = await columnService.updateColumnsSet(data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateTasksSet = createAsyncThunk<IColumnResponse[], ITasksSet[], TypedThunkAPI>(
  'column/updateTasksSet',
  async (data, { rejectWithValue }) => {
    try {
      const response = await columnService.updateTasksSet(data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    }
  }
);

export const addNewTask = createAsyncThunk<ITaskResponse, ITask, TypedThunkAPI>(
  'column/addNewTask',
  async (data: ITask, { rejectWithValue, getState, dispatch }) => {
    try {
      const { _id: idColumn, boardId } = getState().columnStore.currentColumn;
      data.order = getState().columnStore.currentColumn.tasks.length;
      data.users = [];
      data.userId = getState().authStore.userId;
      data.isDone = false;

      const response = await columnService.addNewTask(boardId, idColumn, data);
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

export const deleteTask = createAsyncThunk<ITaskResponse, void, TypedThunkAPI>(
  'column/deleteTask',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { _id, boardId, columnId } = getState().columnStore.currentTask;
      const response = await columnService.deleteTask(boardId, columnId, _id);
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

export const editTask = createAsyncThunk<ITaskResponse, ITask, TypedThunkAPI>(
  'column/editTask',
  async (data: ITask, { rejectWithValue, getState, dispatch }) => {
    try {
      const {
        columnId,
        taskId,
        data: newData,
        boardId,
      } = getTaskInfoForUpdate(getState().columnStore.currentTask);

      newData.title = data.title || newData.title;
      newData.description = data.description || newData.description;
      newData.isDone = data.isDone || newData.isDone || false;

      const response = await columnService.editTask(boardId, columnId, taskId, newData);
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

export const getAllTasksByBoard = createAsyncThunk<ITaskResponse[], void, TypedThunkAPI>(
  'column/getAllTasksByBoard',
  async (_, { rejectWithValue, getState }) => {
    try {
      const idBoard = getState().boardStore.currentBoard._id;
      const response = await columnService.getAllTasksByBoard(idBoard);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        throw err;
      }
      return rejectWithValue(error.response?.data);
    }
  }
);

export const setTaskDone = createAsyncThunk<ITaskResponse, void, TypedThunkAPI>(
  'column/setTaskDone',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { columnId, taskId, data, boardId } = getTaskInfoForUpdate(
        getState().columnStore.currentTask
      );
      data.isDone = true;

      const response = await columnService.editTask(boardId, columnId, taskId, data);
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

export const setTaskNotDone = createAsyncThunk<ITaskResponse, void, TypedThunkAPI>(
  'column/setTaskNotDone',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { columnId, taskId, data, boardId } = getTaskInfoForUpdate(
        getState().columnStore.currentTask
      );
      data.isDone = false;

      const response = await columnService.editTask(boardId, columnId, taskId, data);
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

const columnSlice = createSlice({
  name: 'Column',
  initialState,
  reducers: {
    updateColumns(state: IColumnState, { payload: content }: PayloadAction<IColumnResponse[]>) {
      state.columns = content;
    },
    setCurrentColumn(state: IColumnState, { payload: content }: PayloadAction<IColumnResponse>) {
      state.currentColumn = content;
    },
    setCurrentTask(state: IColumnState, { payload: content }: PayloadAction<ITaskResponse>) {
      state.currentTask = content;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllColumnsByBoard.fulfilled, (state, { payload: columns }) => {
      state.columns = columns;
    });
    builder.addCase(editColumn.fulfilled, (state, { payload: column }) => {
      state.columns = state.columns.map((columnState) => {
        if (columnState._id === column._id) {
          columnState.title = column.title;
          columnState.order = column.order;
        }
        return columnState;
      });
    });
    builder.addCase(addNewColumn.fulfilled, (state, { payload: column }) => {
      state.columns = [...state.columns, column];
      state.currentColumn = column;
    });

    builder.addCase(deleteColumn.fulfilled, (state, { payload: columns }) => {
      state.columns = columns;
      state.currentColumn = initialState.currentColumn;
    });
    builder.addCase(addNewTask.fulfilled, (state, { payload: task }) => {
      state.currentColumn.tasks = [...state.currentColumn.tasks, task];
      state.columns = state.columns.map((column: IColumnResponse) => {
        if (column._id === state.currentColumn._id) {
          return { ...column, tasks: [...state.currentColumn.tasks] };
        }
        return column;
      });
    });
    builder.addCase(deleteTask.fulfilled, (state, { payload: taskResponse }) => {
      const { columnId, _id: taskId } = taskResponse;
      state.columns = state.columns.map((column: IColumnResponse) => {
        if (column._id === columnId) {
          column.tasks = column.tasks.filter((task) => task._id !== taskId);
        }
        return column;
      });
    });
    builder.addCase(editTask.fulfilled, (state, { payload: taskResponse }) => {
      const { columnId } = taskResponse;
      state.columns = state.columns.map((column: IColumnResponse) => {
        if (column._id === columnId) {
          column.tasks = column.tasks.map((task) =>
            task._id === taskResponse._id ? taskResponse : task
          );
        }
        return column;
      });
    });
    builder.addCase(setTaskDone.fulfilled, (state, { payload: taskResponse }) => {
      const { columnId } = taskResponse;
      state.columns = state.columns.map((column: IColumnResponse) => {
        if (column._id === columnId) {
          column.tasks = column.tasks.map((task) =>
            task._id === taskResponse._id ? taskResponse : task
          );
        }
        return column;
      });
    });
    builder.addCase(setTaskNotDone.fulfilled, (state, { payload: taskResponse }) => {
      const { columnId } = taskResponse;
      state.columns = state.columns.map((column: IColumnResponse) => {
        if (column._id === columnId) {
          column.tasks = column.tasks.map((task) =>
            task._id === taskResponse._id ? taskResponse : task
          );
        }
        return column;
      });
    });
  },
});

export const columnReducer = columnSlice.reducer;

export const { setCurrentColumn, setCurrentTask, updateColumns } = columnSlice.actions;

export const columnSelector = (state: RootState): IColumnState => state.columnStore;
