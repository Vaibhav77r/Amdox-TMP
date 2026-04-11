import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,           // Always consider data stale — refetch on every mount
      refetchOnMount: true,   // Refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch on tab switch (can be annoying)
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)