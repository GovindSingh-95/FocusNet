
import { Header } from "@/components/header";
import { DashboardCard } from "@/components/dashboard-layout";
import { TodoList } from "@/components/todo-list";
import { NotesSection } from "@/components/notes-section";
import { BookmarkManager } from "@/components/bookmark-manager";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { HabitTracker } from "@/components/habit-tracker";
import { ThemeProvider } from "@/components/theme-provider";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="focusnet-theme">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* TODO LIST */}
            <DashboardCard title="Tasks" className="lg:col-span-1 h-[500px]">
              <div className="h-[calc(100%-2rem)]">
                <TodoList />
              </div>
            </DashboardCard>
            
            {/* NOTES SECTION */}
            <DashboardCard title="Notes" className="lg:col-span-1 h-[500px]">
              <div className="h-[calc(100%-2rem)]">
                <NotesSection />
              </div>
            </DashboardCard>
            
            {/* BOOKMARK MANAGER */}
            <DashboardCard title="Bookmarks" className="lg:col-span-1 h-[500px]">
              <div className="h-[calc(100%-2rem)]">
                <BookmarkManager />
              </div>
            </DashboardCard>
            
            {/* POMODORO TIMER */}
            <DashboardCard title="Pomodoro Timer" className="md:col-span-1 h-[400px]">
              <div className="h-[calc(100%-2rem)]">
                <PomodoroTimer />
              </div>
            </DashboardCard>
            
            {/* HABIT TRACKER */}
            <DashboardCard title="Habit Tracker" className="md:col-span-1 lg:col-span-2 h-[400px]">
              <div className="h-[calc(100%-2rem)]">
                <HabitTracker />
              </div>
            </DashboardCard>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
