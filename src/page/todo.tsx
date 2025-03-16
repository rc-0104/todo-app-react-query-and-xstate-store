import TodoList from "@/components/todo-list.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";

export default function Todo() {
	return (
		<>
			<h1 className="text-3xl font-bold mb-8 text-center">Todo Application</h1>
			<div className="mt-8">
				<TodoList />
			</div>
			<Toaster />
		</>
	)
}