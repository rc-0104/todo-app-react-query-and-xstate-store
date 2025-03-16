### Todo Application Documentation

## Overview

This is a production-ready, scalable Todo application built with React 19, TypeScript, TanStack Query (formerly React Query), JSONPlaceholder as a data provider, and @xstate/store for state management. The application allows users to add, edit, delete, and filter todos with a clean, responsive interface.

## Technology Stack

- **React 19**: For building the user interface
- **TypeScript**: For type safety and better developer experience
- **@xstate/store**: For lightweight state management
- **TanStack Query**: For data fetching, caching, and synchronization
- **JSONPlaceholder API**: As the backend data provider
- **Tailwind CSS**: For styling
- **shadcn/ui**: For UI components


## File Structure

```plaintext
├── page/
│   └── todo.tsx                # Main Todo page
├── components/
│   ├── todo-filters.tsx        # Todo filtering component
│   ├── todo-form.tsx           # Form for adding new todos
│   ├── todo-item.tsx           # Individual todo item component
│   ├── todo-list.tsx           # List of todos component
│   └── app-provider.tsx        # TanStack Query provider
│   └── hooks/
│       └── use-todo-store.tsx  # Custom hooks for accessing store state
├── lib/
│   ├── api                     # API integration
│   ├── store                   # @xstate/store implementation
│   ├── types.ts                # TypeScript interfaces and types
   
```

## State Management with @xstate/store

The application uses `@xstate/store` for state management, which provides a simple, event-based approach to managing application state.

### Store Definition

```typescript
// lib/todo-store.ts
export const todoStore = createStore({
  context: {
    todos: [],
    filter: 'all' as TodoFilter
  },
  on: {
    SET_TODOS: (context, event: { todos: Todo[] }) => ({
      ...context,
      todos: event.todos
    }),
    ADD_TODO: (context, event: { todo: Todo }) => ({
      ...context,
      todos: [...context.todos, event.todo]
    }),
    UPDATE_TODO: (context, event: { todo: Todo }) => ({
      ...context,
      todos: context.todos.map(todo => 
        todo.id === event.todo.id ? event.todo : todo
      )
    }),
    DELETE_TODO: (context, event: { id: number }) => ({
      ...context,
      todos: context.todos.filter(todo => todo.id !== event.id)
    }),
    SET_FILTER: (context, event: { filter: TodoFilter }) => ({
      ...context,
      filter: event.filter
    })
  }
})
```

### Action Helpers

```typescript
// lib/store/todo-store.ts
export const todoActions = {
  setTodos: (todos: Todo[]) => todoStore.send({ type: 'SET_TODOS', todos }),
  addTodo: (todo: Todo) => todoStore.send({ type: 'ADD_TODO', todo }),
  updateTodo: (todo: Todo) => todoStore.send({ type: 'UPDATE_TODO', todo }),
  deleteTodo: (id: number) => todoStore.send({ type: 'DELETE_TODO', id }),
  setFilter: (filter: TodoFilter) => todoStore.send({ type: 'SET_FILTER', filter })
}
```

### Custom Hooks for Store Access

```typescript
// hooks/use-todo-store.tsx
export function useStore<T>(selector: (state: { context: { todos: Todo[], filter: TodoFilter } }) => T): T {
  const [state, setState] = useState<T>(selector(todoStore.getSnapshot()))
  
  useEffect(() => {
    return todoStore.subscribe(newState => {
      setState(selector(newState))
    })
  }, [selector])
  
  return state
}

export function useTodoFilter() {
  return useStore(state => state.context.filter)
}

export function useFilteredTodos() {
  return useStore(state => {
    const allTodos = state.context.todos
    const filter = state.context.filter
    
    if (filter === 'all') return allTodos
    if (filter === 'completed') return allTodos.filter(todo => todo.completed)
    if (filter === 'active') return allTodos.filter(todo => !todo.completed)
    
    return allTodos
  })
}
```

## Data Fetching with TanStack Query

The application uses TanStack Query for data fetching, caching, and synchronization with the server.

### API Integration

```typescript
// lib/api/todo-api.ts
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async (): Promise<Todo[]> => {
      const response = await fetch(`${API_URL}?_limit=10`)
      if (!response.ok) {
        throw new Error('Failed to fetch todos')
      }
      return response.json()
    },
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (todo: CreateTodoInput): Promise<Todo> => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create todo')
      }
      
      return response.json()
    },
    onSuccess: (newTodo) => {
      queryClient.setQueryData<Todo[]>(['todos'], (oldTodos = []) => {
        const highestId = Math.max(...oldTodos.map(todo => todo.id), 0)
        return [...oldTodos, { ...newTodo, id: highestId + 1 }]
      })
    },
  })
}
```

## Key Components

### TodoList Component

```typescript
// components/todo-list.tsx
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
```

### TodoItem Component

```typescript
// components/todo-item.tsx
export default function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(todo.title)
  const { toast } = useToast()
  
  const updateTodoMutation = useUpdateTodo()
  const deleteTodoMutation = useDeleteTodo()

  const handleToggleComplete = () => {
    const updatedTodo = { ...todo, completed: !todo.completed }
    
    updateTodoMutation.mutate(
      updatedTodo,
      {
        onSuccess: () => {
          todoActions.updateTodo(updatedTodo)
          toast({
            title: 'Todo updated',
            description: `Todo marked as ${!todo.completed ? 'completed' : 'active'}`,
          })
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update todo',
            variant: 'destructive',
          })
        },
      }
    )
  }

  // ... other handlers and JSX
}
```

### TodoForm Component

```typescript
// components/todo-form.tsx
export default function TodoForm() {
  const [title, setTitle] = useState('')
  const createTodoMutation = useCreateTodo()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    const newTodo = { 
      id: Date.now(), // Temporary ID for optimistic UI
      title, 
      completed: false, 
      userId: 1 
    }
    
    createTodoMutation.mutate(
      { title, completed: false, userId: 1 },
      {
        onSuccess: (returnedTodo) => {
          todoActions.updateTodo({
            ...newTodo,
            id: returnedTodo.id
          })
          
          setTitle('')
          toast({
            title: 'Todo created',
            description: 'New todo has been added successfully',
          })
        },
        onError: () => {
          todoActions.deleteTodo(newTodo.id)
          
          toast({
            title: 'Error',
            description: 'Failed to create todo',
            variant: 'destructive',
          })
        },
      }
    )
    
    // Add optimistically
    todoActions.addTodo(newTodo)
  }

  // ... JSX
}
```

### TodoFilters Component

```typescript
// components/todo-filters.tsx
export default function TodoFilters() {
  const currentFilter = useTodoFilter()
  
  const setFilter = (filter: TodoFilter) => {
    todoActions.setFilter(filter)
  }

  return (
    <div className="flex gap-2 mb-4">
      <Button 
        variant={currentFilter === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setFilter('all')}
      >
        All
      </Button>
      <Button 
        variant={currentFilter === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setFilter('active')}
      >
        Active
      </Button>
      <Button 
        variant={currentFilter === 'completed' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setFilter('completed')}
      >
        Completed
      </Button>
    </div>
  )
}
```

## Features and Implementation Details

### 1. Optimistic Updates

The application implements optimistic updates for a better user experience:

- When adding a todo, it's immediately added to the store with a temporary ID
- When updating a todo, the UI is updated immediately before the server response
- When deleting a todo, it's removed from the UI immediately


Example from `TodoForm`:

```typescript
// Add optimistically first
todoActions.addTodo(newTodo)

// Then send to server
createTodoMutation.mutate(
  { title, completed: false, userId: 1 },
  {
    onSuccess: (returnedTodo) => {
      // Update with the real ID from the server
      todoActions.updateTodo({
        ...newTodo,
        id: returnedTodo.id
      })
      // ...
    },
    onError: () => {
      // Remove the optimistic todo on error
      todoActions.deleteTodo(newTodo.id)
      // ...
    },
  }
)
```

### 2. Filtering Todos

The application allows filtering todos by their completion status:

- All todos
- Active todos (not completed)
- Completed todos


The filter state is stored in the `@xstate/store` and accessed via the `useTodoFilter` hook.

### 3. Error Handling

The application implements proper error handling:

- API errors are caught and displayed to the user
- Optimistic updates are rolled back if the server request fails
- Loading states are displayed during API requests


### 4. Responsive Design

The application is fully responsive and works well on all device sizes, using Tailwind CSS for styling.

## TypeScript Types

```typescript
// lib/types.ts
export interface Todo {
  id: number
  title: string
  completed: boolean
  userId: number
}

export interface CreateTodoInput {
  title: string
  completed: boolean
  userId: number
}

export type TodoFilter = 'all' | 'active' | 'completed'
```

## How to Extend the Application

### Adding Authentication

To add authentication, you would:

1. Create an auth store using `@xstate/store`
2. Implement login/signup forms
3. Add authentication headers to API requests
4. Add protected routes


### Adding Categories or Tags

To add categories or tags to todos:

1. Update the `Todo` interface to include a `category` or `tags` field
2. Modify the `TodoForm` to allow selecting categories or tags
3. Add category/tag filtering to the `TodoFilters` component
4. Update the store to handle the new fields


### Adding Due Dates

To add due dates to todos:

1. Update the `Todo` interface to include a `dueDate` field
2. Add a date picker to the `TodoForm`
3. Display the due date in the `TodoItem`
4. Add sorting by due date


### Adding Persistence

To add local persistence:

1. Subscribe to store changes and save to `localStorage`
2. Load from `localStorage` on application startup


```typescript
// Add to todo-store.ts
todoStore.subscribe((state) => {
  localStorage.setItem('todos', JSON.stringify(state.context.todos))
})

// On application startup
const savedTodos = localStorage.getItem('todos')
if (savedTodos) {
  todoActions.setTodos(JSON.parse(savedTodos))
}
```

## Conclusion

This Todo application demonstrates how to build a production-ready, scalable React application using modern tools and practices. It showcases:

- Clean component architecture
- Type-safe development with TypeScript
- Efficient state management with @xstate/store
- Data fetching and synchronization with TanStack Query
- Optimistic UI updates for better user experience
- Responsive design with Tailwind CSS and shadcn/ui


The application can be extended in various ways to add more features and functionality as needed.