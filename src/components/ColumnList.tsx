import React, { FC, ReactElement } from 'react';
import Loader from './Loader';
import AddButton from './Buttons/AddButton';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { loaderSelector } from '../store/loaderSlice';
import {
  columnSelector,
  updateColumns,
  updateColumnsSet,
  updateTasksSet,
} from '../store/columnSlice';
import { showModalWindow } from '../store/modalSlice';
import { ADD_COLUMN } from '../constants/modalField';
import Column from './Column';
import { Box, styled } from '@mui/material';
import {
  DragDropContext,
  Draggable,
  DraggableLocation,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { IColumnResponse } from 'types/columnTypes';
import {
  combineColumns,
  newSetColumnsOrder,
  newSetTasksOrder,
  reorderColumn,
  reorderTask,
} from '../helper/order';
import { useTranslation } from 'react-i18next';

const Container = styled('div')`
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1rem;
  width: 100%;
  overflow: auto;
  position: absolute;
  max-height: 100%;
  height: 100%;
  padding-bottom: 0.5rem;
`;

const ColumnList: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('translation', { keyPrefix: 'fields.column' });
  const { isLoading } = useAppSelector(loaderSelector);
  const { columns } = useAppSelector(columnSelector);

  const onAddColumn = (): void => {
    dispatch(showModalWindow(ADD_COLUMN));
  };

  const onDragStart = (result: DropResult): void => {
    if (result.type === 'COLUMN') {
    }
  };
  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) {
      return;
    }

    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    if (result.type === 'COLUMN') {
      const newList: IColumnResponse[] = reorderColumn(
        columns,
        result.source.index,
        result.destination.index
      );

      dispatch(updateColumns(newList));
      dispatch(updateColumnsSet(newSetColumnsOrder(newList)));
      return;
    }

    if (result.type === 'TASK') {
      const currentColumn = columns.find(
        (column) => column._id === source.droppableId
      ) as IColumnResponse;
      const nextColumn = columns.find(
        (column) => column._id === destination.droppableId
      ) as IColumnResponse;

      const [newCurrentColumn, newNextColumn] = reorderTask(
        currentColumn,
        nextColumn,
        source.index,
        destination.index
      );

      const newListColumns: IColumnResponse[] = combineColumns(
        columns,
        newNextColumn,
        newCurrentColumn
      );
      const newListTasks = newSetTasksOrder([...newCurrentColumn.tasks, ...newNextColumn.tasks]);

      dispatch(updateColumns(newListColumns));
      dispatch(updateTasksSet(newListTasks));
      return;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        {isLoading ? (
          <Loader color="#ffffff" />
        ) : (
          <>
            <Droppable droppableId="board" type="COLUMN" direction="horizontal">
              {(provided): ReactElement => (
                <Container {...provided.droppableProps} ref={provided.innerRef}>
                  {columns.map((column) => (
                    <Column key={column._id} column={column} tasks={column.tasks} />
                  ))}
                  {
                    <Draggable draggableId="AddButtonColumn" index={columns.length}>
                      {(provided): ReactElement => (
                        <AddButton onClick={onAddColumn} dropProvided={provided}>
                          {t('add')}
                        </AddButton>
                      )}
                    </Draggable>
                  }
                  {provided.placeholder}
                </Container>
              )}
            </Droppable>
          </>
        )}
      </Box>
    </DragDropContext>
  );
};

export default ColumnList;
