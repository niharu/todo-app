import { List } from "@chakra-ui/react";

import { TodoTitle } from "./TodoTitle";
import { TodoItem } from "./TodoItem";

import { Todo } from "../model/Todo";

type Props = {
  title: string;
  fontSize: string;
  todoList: Todo[];
  toggleTodoListItemStatus: (id: string, done: boolean) => void;
  deleteTodoListItem: (id: string) => void;
};
export const TodoList = ({
  title,
  fontSize,
  todoList,
  toggleTodoListItemStatus,
  deleteTodoListItem,
}: Props) => {
  return (
    <>
      {todoList.length !== 0 && (
        <>
          <TodoTitle title={title} fontSize={fontSize} mt="12" />
          <List w="full">
            {todoList.map((todo: Todo) => (
              <TodoItem
                todo={todo}
                key={todo.id}
                toggleTodoListItemStatus={toggleTodoListItemStatus}
                deleteTodoListItem={deleteTodoListItem}
              />
            ))}
          </List>
        </>
      )}
    </>
  );
};
