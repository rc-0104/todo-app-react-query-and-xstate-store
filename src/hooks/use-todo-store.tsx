// Custom hook to access the store state
import {todoStore} from "@/lib/store/todo-store.ts";
import {useEffect, useState} from "react";
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

// Convenience selectors
export function useTodoFilter() {
	return useTodoStore((state) => state.context.filter)
}

export function useFilteredTodos() {
	return useTodoStore((state) => {
		const allTodos = state.context.todos
		const filter = state.context.filter

		if (filter === "all") return allTodos
		if (filter === "completed") return allTodos.filter((todo) => todo.completed)
		if (filter === "active") return allTodos.filter((todo) => !todo.completed)

		return allTodos
	})
}
