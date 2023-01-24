import { Todo } from "../model/Todo";
import { useState, useEffect } from "react";

import { ulid } from "ulid";

import * as todoData from "../apis/todos";

export const useTodo = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);

  useEffect(() => {
    todoData.getAllTodosData().then((todoList: Todo[]) => {
      setTodoList([...todoList].reverse());
    });
  }, []);

  const toggleTodoListItemStatus = (id: string, done: boolean) => {
    const todoItem: Todo | undefined = todoList.find((item) => item.id === id);
    if (!todoItem) return;

    const newTodoItem: Todo = { ...todoItem, done: !done };

    todoData.updateTodoData(id, newTodoItem).then((updatedTodo) => {
      const newTodoList = todoList.map((item) =>
        item.id !== updatedTodo.id ? item : updatedTodo
      );

      setTodoList(newTodoList);
    });
  };

  const addTodoListItem = (todoContent: string) => {
    const newTodoItem = {
      content: todoContent,
      id: ulid(),
      done: false,
    };

    return todoData.addTodoData(newTodoItem).then((addTodo) => {
      setTodoList([addTodo, ...todoList]);
    });
  };

  const deleteTodoListItem = (id: string) => {
    todoData.deleteTodoData(id).then((deleteListItemId) => {
      const newTodoList = todoList.filter(
        (item) => item.id !== deleteListItemId
      );

      setTodoList(newTodoList);
    });
  };

  return {
    todoList,
    toggleTodoListItemStatus,
    addTodoListItem,
    deleteTodoListItem,
  };
};
