import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CreateTodoInput, Todo} from "@/lib/types.ts";

const API_URL = "https://jsonplaceholder.typicode.com/todos"

// Fetch all todos
export function useTodos() {
	return useQuery({
		queryKey: ["todos"],
		queryFn: async (): Promise<Todo[]> => {
			const response = await fetch(`${API_URL}?_limit=10`)
			if (!response.ok) {
				throw new Error("Failed to fetch todos")
			}
			return response.json()
		},
	})
}

// Create a new todo
export function useCreateTodo() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (todo: CreateTodoInput): Promise<Todo> => {
			const response = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(todo),
			})

			if (!response.ok) {
				throw new Error("Failed to create todo")
			}

			return response.json()
		},
		onSuccess: (newTodo: Todo) => {
			queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) => {
				// JSONPlaceholder doesn't actually create the item in the database
				// So we need to manually add it to our cache with a unique ID
				const highestId = Math.max(...oldTodos.map((todo) => todo.id), 0)
				return [...oldTodos, { ...newTodo, id: highestId + 1 }]
			})
		},
	})
}


// Update a todo
export function useUpdateTodo() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (todo: Todo): Promise<Todo> => {
			const response = await fetch(`${API_URL}/${todo.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(todo),
			})

			if (!response.ok) {
				throw new Error("Failed to update todo")
			}

			return response.json()
		},
		onSuccess: (updatedTodo: Todo) => {
			queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) => {
				return oldTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
			})
		},
	})
}

// Delete a todo
export function useDeleteTodo() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (todoId: number): Promise<any> => {
			const response = await fetch(`${API_URL}/${todoId}`, {
				method: "DELETE",
			})

			if (!response.ok) {
				throw new Error("Failed to delete todo")
			}

			return response.json();
		},
		onSuccess: (todoId: number) => {
			queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) => {
				return oldTodos.filter((todo) => todo.id !== todoId)
			})
		},
	})
}