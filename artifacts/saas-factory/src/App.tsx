import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard/index";
import NewProject from "@/pages/dashboard/new";
import ProjectDetail from "@/pages/dashboard/project";
import GenerateProject from "@/pages/dashboard/generate";
import DeployProject from "@/pages/dashboard/deploy";
import Templates from "@/pages/templates";
import Billing from "@/pages/billing";
import AppLayout from "@/components/layout/AppLayout";
import LandingLayout from "@/components/layout/LandingLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <LandingLayout>
          <Landing />
        </LandingLayout>
      </Route>
      <Route path="/dashboard">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </Route>
      <Route path="/dashboard/new">
        <AppLayout>
          <NewProject />
        </AppLayout>
      </Route>
      <Route path="/dashboard/:id">
        {params => (
          <AppLayout>
            <ProjectDetail params={params as Record<string, string>} />
          </AppLayout>
        )}
      </Route>
      <Route path="/dashboard/:id/generate">
        {params => (
          <AppLayout>
            <GenerateProject params={params as Record<string, string>} />
          </AppLayout>
        )}
      </Route>
      <Route path="/dashboard/:id/deploy">
        {params => (
          <AppLayout>
            <DeployProject params={params as Record<string, string>} />
          </AppLayout>
        )}
      </Route>
      <Route path="/templates">
        <AppLayout>
          <Templates />
        </AppLayout>
      </Route>
      <Route path="/billing">
        <AppLayout>
          <Billing />
        </AppLayout>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
