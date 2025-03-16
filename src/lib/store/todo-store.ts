// Define the store context type
import {Todo, TodoFilter} from "@/lib/types.ts";
import {createStore} from "@xstate/store";

export interface TodoContext {
	todos: Todo[],
	filter: TodoFilter
}
// Create the todo store
export const todoStore = createStore({
	context: {
		todos: [] as Todo[],
		filter: "all" as TodoFilter
	},
	on: {
		SET_TODOS: (context, event: { todos: Todo[] } ) => ({
			...context,
			todos: event.todos
		}),
		ADD_TODO: (context, event: { todo: Todo }) => ({
			...context,
			todos: [...context.todos, event.todo ]
		}),
		UPDATE_TODO: (context, event: { todo: Todo }) => ({
			...context,
			todos: context.todos.map((todo: Todo) => (todo.id === event.todo.id ? event.todo : todo))
		}),
		DELETE_TODO: (context, event: { id: number }) => ({
			...context,
			todos: context.todos.filter((todo: Todo) => todo.id !== event.id)
		}),
		SET_FILTER: (context, event: { filter: TodoFilter }) => ({
			...context,
			filter: event.filter,
		})
	}
})