
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";
import { storage } from "@/lib/storage";

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export function PomodoroTimer() {
  // Default settings in minutes
  const defaultSettings: TimerSettings = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  };

  const [settings, setSettings] = useState<TimerSettings>(() => 
    storage.get<TimerSettings>("focusnest-pomodoro-settings", defaultSettings)
  );
  
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  // Maximum time for the current mode (for progress calculation)
  const maxTime = settings[mode] * 60;
  
  // Calculate progress percentage
  const progress = ((maxTime - timeLeft) / maxTime) * 100;

  // Save settings to localStorage when they change
  useEffect(() => {
    storage.set("focusnest-pomodoro-settings", settings);
  }, [settings]);

  // Timer effect
  useEffect(() => {
    let interval: number;
    
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      playAlarm();
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Reset timeLeft when mode changes
  useEffect(() => {
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  const handleTimerComplete = () => {
    if (mode === "focus") {
      // Increment cycles counter
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      
      // After 4 focus sessions, take a long break
      if (newCycles % 4 === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      // After break, back to focus mode
      setMode("focus");
    }
  };

  const playAlarm = () => {
    // Simple beep notification - in a real app, you might want a proper sound
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.5;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 200);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex space-x-2 mb-4">
        <Button
          variant={mode === "focus" ? "default" : "outline"}
          onClick={() => {
            setMode("focus");
            setIsActive(false);
          }}
        >
          Focus
        </Button>
        <Button
          variant={mode === "shortBreak" ? "default" : "outline"}
          onClick={() => {
            setMode("shortBreak");
            setIsActive(false);
          }}
        >
          Short Break
        </Button>
        <Button
          variant={mode === "longBreak" ? "default" : "outline"}
          onClick={() => {
            setMode("longBreak");
            setIsActive(false);
          }}
        >
          Long Break
        </Button>
      </div>

      <Card className="w-full max-w-md p-6 flex flex-col items-center">
        <div className="text-4xl font-bold mb-4">{formatTime(timeLeft)}</div>
        
        <Progress value={progress} className="w-full h-2 mb-6" />
        
        <div className="flex space-x-2">
          <Button onClick={toggleTimer} size="lg">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={resetTimer}>
            <RotateCcw className="mr-2" />
            Reset
          </Button>
        </div>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        Completed cycles today: {completedCycles}
      </div>
    </div>
  );
}
