// Custom hook to access the store state
import {todoStore} from "@/lib/store/todo-store.ts";
import {useEffect, useState} from "react";
import {useSelector} from "@xstate/store/react";
import {Todo, TodoFilter} from "@/lib/types.ts";

// Custom hook to access the store state
export function useTodoStore<T>(selector: (state: { context: { todos: Todo[]; filter: TodoFilter } }) => T): T {
	const [state, setState] = useState<T>(selector(todoStore.getSnapshot()))

	useEffect(() => {
		todoStore.subscribe((newState) => {
			setState(selector(newState))
		})
	}, [selector])

	return state
}

// Helper functions to send event to the store
export const todoActions = {
	setTodos: (todos: Todo[]) => todoStore.send({ type: "SET_TODOS", todos }),
	addTodo: (todo: Todo) => todoStore.send({ type: "ADD_TODO", todo }),
	updateTodo: (todo: Todo) => todoStore.send({ type: "UPDATE_TODO", todo }),
	deleteTodo: (id: number) => todoStore.send({ type: "DELETE_TODO", id }),
	setFilter: (filter: TodoFilter) => todoStore.send({ type: "SET_FILTER", filter}),
	getFilteredTodos: () => useTodoStore((state) => {
		const todos = state.context.todos;
		const filter = state.context.filter;

		if(filter === "completed") {
			return todos.filter((todo) => todo.completed);
		}
		if(filter === "active") {
			return todos.filter((todo) => !todo.completed);
		}

		return todos;
	})
}

export const useTodos = () => ({
	todos: useSelector(todoStore, (state) => state.context.todos),
	filter: useSelector(todoStore, (state) => state.context.filter),
	...todoActions
})
