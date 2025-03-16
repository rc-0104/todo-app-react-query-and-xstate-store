import {useState} from "react";
import {useCreateTodo} from "@/lib/api/todo-api.ts";
import {useToast} from "@/hooks/use-toast.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {todoActions} from "@/lib/store/todo-store.ts";

export default function TodoForm() {
	const [title, setTitle] = useState("");
	const createTodoMutation = useCreateTodo();
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!title.trim()) {
			toast({
				title: "Please enter a title",
				variant: "destructive",
			});
			return;
		}

		const newTodo = {
			id: Date.now(), // Temporary Id for optimistic UI
			title,
			completed: false,
			userId: 1,
		}

		createTodoMutation.mutate(
			{ title, completed: false, userId: 1},
			{
				onSuccess: (todo) => {
					todoActions.updateTodo({
						...todo,
						id: newTodo.id,
					})


					// Add optimistically
					todoActions.addTodo(newTodo);

					setTitle("");
					toast({
						title: "Todo created successfully",
						variant: "default",
					});
				},
				onError: (error) => {
					toast({
						title: "Failed to create todo",
						description: error.message,
						variant: "destructive",
					});
				},
			}
		)
	};

	return (
			<form onSubmit={handleSubmit} className="flex gap-2">
				<Input
					placeholder="Add a new todo..."
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="flex-1"
					disabled={createTodoMutation.isPending}
				/>
				<Button variant={"default"} type="submit" disabled={!title.trim() || createTodoMutation.isPending}>
					Add Todo
				</Button>
			</form>
	)
}