
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";

interface DayLog {
  date: string; // ISO string
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  logs: DayLog[];
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => 
    storage.get<Habit[]>("focusnest-habits", [])
  );
  const [newHabitName, setNewHabitName] = useState("");
  
  // Get days of the current week
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - dayOfWeek + i);
    return {
      date,
      dayName: date.toLocaleDateString(undefined, { weekday: 'short' }),
      dateStr: date.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    storage.set("focusnest-habits", habits);
  }, [habits]);

  const addHabit = () => {
    if (newHabitName.trim() === "") return;
    
    setHabits([
      ...habits,
      {
        id: Date.now().toString(),
        name: newHabitName,
        logs: [],
      },
    ]);
    setNewHabitName("");
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const toggleHabitForDay = (habitId: string, dateStr: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          // Find if log exists for this date
          const existingLogIndex = habit.logs.findIndex(
            (log) => log.date.startsWith(dateStr)
          );
          
          if (existingLogIndex >= 0) {
            // Toggle existing log
            const updatedLogs = [...habit.logs];
            updatedLogs[existingLogIndex] = {
              ...updatedLogs[existingLogIndex],
              completed: !updatedLogs[existingLogIndex].completed,
            };
            return { ...habit, logs: updatedLogs };
          } else {
            // Add new log
            return {
              ...habit,
              logs: [
                ...habit.logs,
                { date: `${dateStr}T00:00:00.000Z`, completed: true },
              ],
            };
          }
        }
        return habit;
      })
    );
  };

  const isHabitCompletedOnDate = (habit: Habit, dateStr: string) => {
    return habit.logs.some(
      (log) => log.date.startsWith(dateStr) && log.completed
    );
  };

  const calculateStreakForHabit = (habit: Habit) => {
    let streak = 0;
    
    // Start from today and go backward
    for (let i = 0; i < 30; i++) { // Check up to 30 days in the past
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (isHabitCompletedOnDate(habit, dateStr)) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }
    
    return streak;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New habit..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") addHabit();
          }}
          className="flex-grow"
        />
        <Button onClick={addHabit} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-[3fr,repeat(7,1fr),1fr] gap-2 mb-2 text-center text-sm">
            <div className="text-left font-medium">Habit</div>
            {weekDays.map((day) => (
              <div 
                key={day.dateStr} 
                className={`font-medium ${day.date.toDateString() === new Date().toDateString() ? "text-primary" : ""}`}
              >
                {day.dayName}
              </div>
            ))}
            <div className="text-center font-medium">Streak</div>
          </div>
          
          {habits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No habits yet. Add one above!
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="grid grid-cols-[3fr,repeat(7,1fr),1fr] gap-2 py-2 border-b items-center group"
              >
                <div className="text-left flex items-center justify-between">
                  <span>{habit.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteHabit(habit.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {weekDays.map((day) => (
                  <div key={day.dateStr} className="flex justify-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer 
                        ${isHabitCompletedOnDate(habit, day.dateStr) ? "bg-green-500 text-white" : "bg-muted"}`}
                      onClick={() => toggleHabitForDay(habit.id, day.dateStr)}
                    >
                      {isHabitCompletedOnDate(habit, day.dateStr) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="text-center font-semibold">
                  {calculateStreakForHabit(habit)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
