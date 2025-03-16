import TodoList from "@/components/todo-list.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {TodoFilters} from "@/components/todo-filters.tsx";
import {Suspense} from "react";

export default function Todo() {
	return (
		<>
			<h1 className="text-3xl font-bold mb-8 text-center">Todo Application</h1>
			<div className="mt-8">
				<TodoFilters />
				<Suspense fallback={<div className={"mt-4 text-center"}>Loading todos...</div>}>
					<TodoList />
				</Suspense>
			</div>
			<Toaster />
		</>
	)
}