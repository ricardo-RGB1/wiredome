'use client'; 

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";


 /**
  * QueryProvider component that wraps the application with React Query functionality
  * 
  * Creates a QueryClient instance and provides it to all child components through context.
  * The QueryClient is memoized using useState to ensure it persists across re-renders.
  *
  * @param children - Child components that will have access to React Query functionality
  * @returns QueryClientProvider wrapped around the children
  */
 export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
  );
};
