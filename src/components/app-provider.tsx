import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactNode} from "react";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

export function AppProvider({ children }: { children: ReactNode }) {{
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				refetchOnWindowFocus: false,
			}
		}
	})
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}}