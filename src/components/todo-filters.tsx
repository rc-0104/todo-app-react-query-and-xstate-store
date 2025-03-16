import {useTodoFilter} from "@/hooks/use-todo-store.tsx";
import {useCallback} from "react";
import {todoActions} from "@/lib/store/todo-store.ts";
import {TodoFilter} from "@/lib/types.ts";

export function TodoFilters () {
	  const currentFilter = useTodoFilter();
	  const setFilter = useCallback((filter: TodoFilter) => {
		  todoActions.setFilter(filter)
	  }, [])

  return (
	<div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
	  <h2 className="text-lg font-semibold">Filters</h2>
	  <div className="flex space-x-4">
		<button
		  onClick={() => setFilter("all")}
		  className={`px-4 py-2 rounded ${currentFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
		>
		  All
		</button>
		<button
		  onClick={() => setFilter("completed")}
		  className={`px-4 py-2 rounded ${currentFilter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
		>
		  Completed
		</button>
		<button
		  onClick={() => setFilter("active")}
		  className={`px-4 py-2 rounded ${currentFilter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
		>
		  Active
		</button>
	  </div>
	</div>
  )
}