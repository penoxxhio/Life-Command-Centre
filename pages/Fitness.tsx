import React, { useState } from 'react';
import { AppData, Workout, WhoopData } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Check, Clipboard, Activity, Moon, Zap, BarChart3, Plus, Dumbbell, Flame, Download, AlertCircle } from 'lucide-react';
import { parseWorkoutLog, isAiReady } from '../services/geminiService';
import { ProgressBar } from '../components/ui/ProgressBar';
import { exportData } from '../services/storageService';

interface FitnessProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
}

export const FitnessPage: React.FC<FitnessProps> = ({ data, updateData }) => {
  const [showWhoopModal, setShowWhoopModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showHevyModal, setShowHevyModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const aiAvailable = isAiReady();

  // Whoop Form State
  const [whoopForm, setWhoopForm] = useState<WhoopData>(data.whoopData);

  // Workout Form State
  const [workoutType, setWorkoutType] = useState('Push');
  const [workoutDuration, setWorkoutDuration] = useState<string>('60');
  const [workoutNote, setWorkoutNote] = useState('');
  
  // Hevy Paste State
  const [hevyText, setHevyText] = useState('');

  // Delete Confirm State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const handleUpdateWhoop = () => {
      updateData({
          whoopData: { ...whoopForm, lastUpdated: new Date().toISOString().split('T')[0] }
      });
      setShowWhoopModal(false);
  };

  const handleLogWorkout = () => {
      const newWorkout: Workout = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString().split('T')[0],
          type: workoutType,
          duration: parseInt(workoutDuration) || 0,
          notes: workoutNote,
          completed: true
      };
      updateData({ workouts: [newWorkout, ...data.workouts] });
      setShowWorkoutModal(false);
      setWorkoutNote('');
  };

  const handleParseHevy = async () => {
      if (!aiAvailable) return;
      setIsParsing(true);
      const exercises = await parseWorkoutLog(hevyText);
      setIsParsing(false);
      
      if (exercises && exercises.length > 0) {
          const mainType = exercises[0]?.type || 'Mixed';
          const totalDuration = exercises.reduce((acc, curr) => acc + (curr.duration || 0), 0) || 60;
          const summaryNote = exercises.map(e => `${e.type}: ${e.notes}`).join('\n');

          const newWorkout: Workout = {
              id: Math.random().toString(36).substr(2, 9),
              date: new Date().toISOString().split('T')[0],
              type: mainType,
              duration: totalDuration,
              notes: summaryNote.substring(0, 100) + '...', // Truncate for summary
              completed: true
          };

          updateData({ workouts: [newWorkout, ...data.workouts] });
          setShowHevyModal(false);
          setHevyText('');
      } else {
          alert('Could not parse workout data. Please try again.');
      }
  };

  const confirmDeleteWorkout = (id: string) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Workout',
          message: 'Are you sure you want to delete this workout log?',
          onConfirm: () => {
              updateData({ workouts: data.workouts.filter(w => w.id !== id) });
          }
      });
  };

  // Weekly Stats Logic
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  
  const weeklyWorkouts = data.workouts.filter(w => w.date >= startOfWeekStr);
  const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* 1. Whoop Data Card */}
      <Card title={`WHOOP METRICS • ${data.whoopData.lastUpdated || 'NO DATA'}`} action={
          <div className="flex gap-2">
             <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => exportData(data, 'file', 'fitness')}>
                <Download size={14} />
             </Button>
             <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => {
                 setWhoopForm(data.whoopData);
                 setShowWhoopModal(true);
             }}>UPDATE</Button>
          </div>
      }>
          <div className="grid grid-cols-4 gap-2 text-center mb-4">
              <div className="bg-background/40 rounded-lg p-2.5 border border-border/50 shadow-sm">
                  <p className="text-[10px] text-textSecondary uppercase flex justify-center items-center gap-1 mb-1"><Zap size={10} /> Rec</p>
                  <p className={`font-mono font-bold text-lg ${
                      data.whoopData.recovery > 66 ? 'text-primary' : data.whoopData.recovery > 33 ? 'text-warning' : 'text-alert'
                  }`}>{data.whoopData.recovery}%</p>
              </div>
              <div className="bg-background/40 rounded-lg p-2.5 border border-border/50 shadow-sm">
                  <p className="text-[10px] text-textSecondary uppercase flex justify-center items-center gap-1 mb-1"><Activity size={10} /> HRV</p>
                  <p className="font-mono font-bold text-lg text-textPrimary">{data.whoopData.hrv}</p>
              </div>
              <div className="bg-background/40 rounded-lg p-2.5 border border-border/50 shadow-sm">
                  <p className="text-[10px] text-textSecondary uppercase flex justify-center items-center gap-1 mb-1"><Flame size={10} /> Cal</p>
                  <p className="font-mono font-bold text-lg text-textPrimary">{data.whoopData.caloriesBurned}</p>
              </div>
              <div className="bg-background/40 rounded-lg p-2.5 border border-border/50 shadow-sm">
                  <p className="text-[10px] text-textSecondary uppercase flex justify-center items-center gap-1 mb-1"><BarChart3 size={10} /> Str</p>
                  <p className="font-mono font-bold text-lg text-info">{data.whoopData.strain}</p>
              </div>
          </div>
          
          <div className="space-y-2 px-1">
              <div className="flex justify-between text-xs">
                  <span className="text-textSecondary flex items-center gap-1.5 font-medium"><Moon size={12}/> Sleep Performance</span>
                  <span className="font-mono text-white">{data.whoopData.hoursSlept} / {data.fitnessGoals.sleepGoal} hrs</span>
              </div>
              <ProgressBar value={data.whoopData.hoursSlept} max={data.fitnessGoals.sleepGoal} color="#6B8EAF" />
          </div>
      </Card>

      {/* 2. Workout Log */}
      <Card title="WEEKLY TRAINING" action={
          <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className={`h-8 px-2 text-xs bg-card hover:bg-border border-border/50 ${!aiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={() => aiAvailable && setShowHevyModal(true)}
                disabled={!aiAvailable}
              >
                  <Clipboard size={14} className="mr-1"/> PASTE
              </Button>
              <Button variant="primary" className="h-8 px-2 text-xs shadow-lg shadow-accent/20" onClick={() => setShowWorkoutModal(true)}>
                  <Plus size={14} className="mr-1"/> LOG
              </Button>
          </div>
      }>
          <div className="flex items-end gap-2 mb-4">
              <h2 className="text-3xl font-mono font-bold text-white tracking-tighter">{weeklyWorkouts.length}</h2>
              <span className="text-xs text-textSecondary mb-1.5 font-medium uppercase tracking-wide">sessions this week</span>
          </div>

          <div className="space-y-3 pb-2">
              {weeklyWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-card/50 border border-border/50 rounded-xl p-3 flex justify-between items-center shadow-sm hover:border-border transition-colors">
                      <div className="flex items-center gap-3">
                          <div className="bg-background p-2.5 rounded-full border border-border/50 text-accent">
                              <Dumbbell size={18} />
                          </div>
                          <div>
                              <p className="font-bold text-sm text-textPrimary">{workout.type} Workout</p>
                              <p className="text-xs text-textSecondary mt-0.5 font-mono">{workout.duration} mins • {new Date(workout.date).toLocaleDateString(undefined, {weekday: 'short'})}</p>
                          </div>
                      </div>
                      <button onClick={() => confirmDeleteWorkout(workout.id)} className="text-textSecondary hover:text-alert p-2 rounded-lg transition-colors">
                          <span className="text-[10px] font-mono font-bold">DEL</span>
                      </button>
                  </div>
              ))}
              {weeklyWorkouts.length === 0 && (
                  <div className="text-center py-8 bg-card/30 rounded-xl border border-dashed border-border/50">
                      <p className="text-textSecondary text-xs">No workouts logged this week.</p>
                  </div>
              )}
          </div>
      </Card>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
      />

      {/* MODALS */}
      <Modal isOpen={showWhoopModal} onClose={() => setShowWhoopModal(false)} title="Update Whoop Data">
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                      label="Recovery (%)"
                      type="number" inputMode="numeric"
                      value={whoopForm.recovery} onChange={e => setWhoopForm({...whoopForm, recovery: parseInt(e.target.value)||0})} 
                  />
                  <Input 
                      label="Strain (0-21)"
                      type="number" inputMode="decimal"
                      value={whoopForm.strain} onChange={e => setWhoopForm({...whoopForm, strain: parseFloat(e.target.value)||0})} 
                  />
                  <Input 
                      label="Calories Burned"
                      type="number" inputMode="numeric"
                      value={whoopForm.caloriesBurned} onChange={e => setWhoopForm({...whoopForm, caloriesBurned: parseInt(e.target.value)||0})} 
                  />
                  <Input 
                      label="RHR (bpm)"
                      type="number" inputMode="numeric"
                      value={whoopForm.rhr} onChange={e => setWhoopForm({...whoopForm, rhr: parseInt(e.target.value)||0})} 
                  />
                  <Input 
                      label="Hours Slept"
                      type="number" inputMode="decimal"
                      value={whoopForm.hoursSlept} onChange={e => setWhoopForm({...whoopForm, hoursSlept: parseFloat(e.target.value)||0})} 
                  />
                  <Input 
                      label="HRV (ms)"
                      type="number" inputMode="numeric"
                      value={whoopForm.hrv} onChange={e => setWhoopForm({...whoopForm, hrv: parseInt(e.target.value)||0})} 
                  />
              </div>
              <Button fullWidth onClick={handleUpdateWhoop} className="mt-2">SAVE METRICS</Button>
          </div>
      </Modal>

      <Modal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Log Workout">
          <div className="space-y-4">
              <Select 
                  label="Workout Type"
                  value={workoutType} onChange={e => setWorkoutType(e.target.value)}
              >
                  <option value="Push">Push</option>
                  <option value="Pull">Pull</option>
                  <option value="Legs">Legs</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
              </Select>
              
              <Input 
                  label="Duration (mins)"
                  type="number" inputMode="numeric"
                  value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} 
              />
              
              <div>
                  <label className="block text-xs text-textSecondary mb-1.5 ml-1 font-medium">Notes</label>
                  <textarea 
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all outline-none h-24 resize-none"
                      value={workoutNote} onChange={e => setWorkoutNote(e.target.value)} placeholder="Bench press 80kg x 5..." 
                  />
              </div>
              <Button fullWidth onClick={handleLogWorkout} className="mt-2">LOG WORKOUT</Button>
          </div>
      </Modal>

      <Modal isOpen={showHevyModal} onClose={() => setShowHevyModal(false)} title="Paste from Hevy">
          <div className="space-y-4">
              {!aiAvailable && (
                <div className="bg-alert/10 border border-alert/20 rounded-lg p-3 mb-2 flex items-center gap-3">
                  <AlertCircle size={18} className="text-alert shrink-0" />
                  <p className="text-[11px] text-alert font-medium leading-tight">
                    API_KEY missing. Set it in your Netlify Environment Variables to enable parsing.
                  </p>
                </div>
              )}
              <p className="text-xs text-textSecondary bg-card/50 p-3 rounded-lg border border-border/50">
                  Copy your workout summary text from the Hevy app (Share -&gt; Copy Text) and paste it below. AI will extract the details.
              </p>
              <textarea 
                  className={`w-full bg-background/50 border border-border rounded-lg p-3 text-textPrimary h-32 text-xs font-mono focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none ${!aiAvailable ? 'opacity-50' : ''}`}
                  value={hevyText} 
                  onChange={e => setHevyText(e.target.value)} 
                  placeholder={aiAvailable ? "Paste workout text here..." : "AI Features Disabled"} 
                  disabled={!aiAvailable}
              />
              <Button fullWidth onClick={handleParseHevy} disabled={isParsing || !aiAvailable} className="mt-2">
                  {isParsing ? 'ANALYZING...' : 'PARSE & LOG'}
              </Button>
          </div>
      </Modal>

    </div>
  );
};