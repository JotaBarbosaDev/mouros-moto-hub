
import { Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/providers/ThemeProvider';

// Routes
import { Spinner } from '@/components/common/Spinner';
import NotFound from '@/pages/NotFound';
import Members from '@/pages/Members';
import Bar from '@/pages/Bar';
import Garage from '@/pages/Garage';
import Administration from '@/pages/Administration';
import Settings from '@/pages/Settings';
import Index from '@/pages/Index';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/membros" element={<Members />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/garagem" element={<Garage />} />
              <Route path="/administracao" element={<Administration />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
