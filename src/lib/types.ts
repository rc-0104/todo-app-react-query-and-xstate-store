export interface Todo {
	id: number;
	title: string;
	completed: boolean;
	userId: number;
}

export interface CreateTodoInput {
	title: string;
	completed: boolean;
	userId: number;
}

export type TodoFilter = "all" | "active" | "completed"