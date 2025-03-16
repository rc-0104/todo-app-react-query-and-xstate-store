import {useEffect} from "react";
import {todoActions} from "@/lib/store/todo-store.ts";
import {useFilteredTodos} from "@/hooks/use-todo-store.tsx";
import {useTodos} from "@/lib/api/todo-api.ts";
import TodoItem from "@/components/todo-item.tsx";
import {Todo} from "@/lib/types.ts";

export default function TodoList () {
	const { data: todos, isLoading, error } = useTodos();
	const filteredTodos = useFilteredTodos();

	useEffect(() => {
		if(todos) {
			todoActions.setTodos(todos);
		}
	}, [todos])

	if(isLoading) {
		return (
			<div className="text-center py-4">
				Loading todos...
			</div>
		)
	}

	if(error) {
		return (
			<div className="text-center py-4 text-red-500">
				Error loadings todos
			</div>
		)
	}

	if(!filteredTodos.length) {
		return (
			<div className="text-center py-4">
				No todos found
			</div>
		)
	}

	return (
		<ul className="space-y-3 p-2 mt-4">
			{
				filteredTodos.map((todo: Todo) => (
					<TodoItem key={todo.id} todo={todo} />
				))
			}
		</ul>
	)
}