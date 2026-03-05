import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotesProvider } from "@/contexts/NotesContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import KeepLayout from "@/components/keep/KeepLayout";
import Index from "./pages/Index";
import ArchivePage from "./pages/ArchivePage";
import TrashPage from "./pages/TrashPage";
import RemindersPage from "./pages/RemindersPage";
import LabelsPage from "./pages/LabelsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <NotesProvider>
            <Routes>
              <Route element={<KeepLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/labels" element={<LabelsPage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/trash" element={<TrashPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotesProvider>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
