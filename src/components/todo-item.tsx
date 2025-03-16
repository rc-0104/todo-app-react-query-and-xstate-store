import { useState } from "react"
import {Pencil, Trash2} from "lucide-react";
import { useToast } from "@/hooks/use-toast.tsx"
import { todoActions } from "@/lib/store/todo-store"
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useDeleteTodo, useUpdateTodo } from "@/lib/api/todo-api.ts"
import {Todo} from "@/lib/types.ts";

interface TodoItemProps {
	todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedTitle, setEditedTitle] = useState(todo.title)
	const { toast } = useToast()

	const updateTodoMutation = useUpdateTodo()
	const deleteTodoMutation = useDeleteTodo()

	const handleToggleComplete = () => {
		const updatedTodo = { ...todo, completed: !todo.completed }

		updateTodoMutation.mutate(updatedTodo, {
			onSuccess: () => {
				// Update local store immediately for optimistic UI
				todoActions.updateTodo(updatedTodo)

				toast({
					title: "Todo updated",
					description: `Todo marked as ${!todo.completed ? "completed" : "active"}`,
				})
			},
			onError: () => {
				toast({
					title: "Error",
					description: "Failed to update todo",
					variant: "destructive",
				})
			},
		})
	}

	const handleDelete = () => {
		deleteTodoMutation.mutate(todo.id, {
			onSuccess: () => {
				// Update local store immediately for optimistic UI
				todoActions.deleteTodo(todo.id)

				toast({
					title: "Todo deleted",
					description: "Todo has been removed successfully",
				})
			},
			onError: () => {
				toast({
					title: "Error",
					description: "Failed to delete todo",
					variant: "destructive",
				})
			},
		})
	}

	const handleUpdate = () => {
		if (editedTitle.trim() === "") return

		const updatedTodo = { ...todo, title: editedTitle }

		updateTodoMutation.mutate(updatedTodo, {
			onSuccess: () => {
				// Update local store immediately for optimistic UI
				todoActions.updateTodo(updatedTodo)

				setIsEditing(false)
				toast({
					title: "Todo updated",
					description: "Todo title has been updated successfully",
				})
			},
			onError: () => {
				toast({
					title: "Error",
					description: "Failed to update todo",
					variant: "destructive",
				})
			},
		})
	}

	return (
		<Card className={`${todo.completed ? "bg-muted/50" : ""}`}>
			<CardContent className="p-4 flex items-center justify-between">
				<div className="flex items-center gap-3 flex-1">
					<Checkbox
						id={`todo-${todo.id}`}
						checked={todo.completed}
						onCheckedChange={handleToggleComplete}
						disabled={updateTodoMutation.isPending}
					/>

					{isEditing ? (
						<div className="flex-1 flex gap-2">
							<Input
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								className="flex-1"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === "Enter") handleUpdate()
									if (e.key === "Escape") setIsEditing(false)
								}}
							/>
							<Button onClick={handleUpdate} disabled={updateTodoMutation.isPending}>
								Save
							</Button>
							<Button variant="outline" onClick={() => setIsEditing(false)}>
								Cancel
							</Button>
						</div>
					) : (
						<label
							htmlFor={`todo-${todo.id}`}
							className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}
						>
							{todo.title}
						</label>
					)}
				</div>

				{!isEditing && (
					<div className="flex gap-1">
						<Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} disabled={todo.completed}>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleteTodoMutation.isPending}>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

