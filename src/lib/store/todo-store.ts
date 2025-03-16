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

// Helper functions to send events to the store
export const todoActions = {
	setTodos: (todos: Todo[]) => todoStore.send({ type: "SET_TODOS", todos }),
	addTodo: (todo: Todo) => todoStore.send({ type: "ADD_TODO", todo }),
	updateTodo: (todo: Todo) => todoStore.send({ type: "UPDATE_TODO", todo }),
	deleteTodo: (id: number) => todoStore.send({ type: "DELETE_TODO", id }),
	setFilter: (filter: TodoFilter) => todoStore.send({ type: "SET_FILTER", filter }),
}
