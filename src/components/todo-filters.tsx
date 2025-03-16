import {useTodoFilter} from "@/hooks/use-todo-store.tsx";
import {useCallback} from "react";
import {todoActions} from "@/lib/store/todo-store.ts";
import {TodoFilter} from "@/lib/types.ts";
import {Button} from "@/components/ui/button.tsx";

export default function TodoFilters () {
	  const currentFilter = useTodoFilter();
	  const setFilter = useCallback((filter: TodoFilter) => {
		  todoActions.setFilter(filter)
	  }, [])

  return (
	<div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
	  <h2 className="text-lg font-semibold">Filters</h2>
	  <div className="flex space-x-4">
		<Button
		  onClick={() => setFilter("all")}
		  variant={`${currentFilter === "all" ? "default" : "outline"}`}
		>
		  All
		</Button>
		<Button
		  onClick={() => setFilter("completed")}
		  variant={`${currentFilter === "completed" ? "default" : "outline"}`}
		>
		  Completed
		</Button>
		<Button
			variant={`${currentFilter === "active" ? "default" : "outline"}`}
		  onClick={() => setFilter("active")}
		>
		  Active
		</Button>
	  </div>
	</div>
  )
}