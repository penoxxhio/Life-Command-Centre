
import React, { useState, useEffect } from 'react';
import { AppData, Workout, WhoopData, HealthDayData } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Clipboard, Activity, Moon, Zap, BarChart3, Plus, Dumbbell, Flame, Download, AlertCircle, HeartPulse, Footprints, Clock } from 'lucide-react';
import { parseWorkoutLog, isAiReady } from '../services/geminiService';
import { exportData } from '../services/storageService';
import { getHealthImport, getHealthDay } from '../services/healthImportService';
import { ProgressBar } from '../components/ui/ProgressBar';

interface FitnessProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
}

export const FitnessPage: React.FC<FitnessProps> = ({ data, updateData }) => {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showHevyModal, setShowHevyModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const aiAvailable = isAiReady();

  // Load imported health data
  const [latestSleepDay, setLatestSleepDay] = useState<HealthDayData | null>(null);
  const [latestHeartDay, setLatestHeartDay] = useState<HealthDayData | null>(null);
  const [latestStepsDay, setLatestStepsDay] = useState<HealthDayData | null>(null);
  const [latestActivityDay, setLatestActivityDay] = useState<HealthDayData | null>(null);
  
  const [hasHealthData, setHasHealthData] = useState(false);
  const [recentSleeps, setRecentSleeps] = useState<number[]>([]);
  const [recentSteps, setRecentSteps] = useState<number[]>([]);

  useEffect(() => {
    const imp = getHealthImport();
    if (imp && imp.days.length > 0) {
        setHasHealthData(true);
        // Get last 7 days for charts
        const daysForCharts = imp.days.slice(0, 7).reverse();
        setRecentSleeps(daysForCharts.map(d => d.sleep ? d.sleep.asleepHours : 0));
        setRecentSteps(daysForCharts.map(d => d.steps));

        // Find latest sleep (most recent first)
        const lastSleep = imp.days.find(d => d.sleep !== null);
        if (lastSleep) setLatestSleepDay(lastSleep);

        // Find latest heart (RHR or HRV)
        const lastHeart = imp.days.find(d => d.restingHR !== null || d.hrvAvg !== null);
        if (lastHeart) setLatestHeartDay(lastHeart);

        // Find latest steps
        const lastSteps = imp.days.find(d => d.steps > 0);
        if (lastSteps) setLatestStepsDay(lastSteps);

        // Find latest activity (Move, Exercise, or Stand)
        const lastActivity = imp.days.find(d => d.activeCalories > 0 || d.exerciseMinutes > 0 || d.standHours > 0);
        if (lastActivity) setLatestActivityDay(lastActivity);
    }
  }, []);

  // Manual Form State (Whoop/Apple)
  const [manualForm, setManualForm] = useState<WhoopData>(data.whoopData);

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

  const handleManualUpdate = () => {
      updateData({
          whoopData: { ...manualForm, lastUpdated: new Date().toISOString().split('T')[0] }
      });
      setShowUpdateModal(false);
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

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - d.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Weekly Stats Logic
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  
  // Merge Manual + Imported Workouts
  const manualWorkouts = data.workouts.filter(w => w.date >= startOfWeekStr);
  
  let importedWorkoutsThisWeek: Workout[] = [];
  const imp = getHealthImport();
  if (imp) {
      importedWorkoutsThisWeek = imp.days
      .filter(d => d.date >= startOfWeekStr && d.workouts)
      .flatMap(d => d.workouts!.map(w => ({
          id: `imported_${w.startDate}`,
          date: d.date,
          type: w.type,
          duration: w.duration,
          notes: `${w.source} Import`,
          completed: true,
          isImported: true
      } as unknown as Workout)));
  }

  const allWeeklyWorkouts = [...manualWorkouts, ...importedWorkoutsThisWeek].sort((a,b) => b.date.localeCompare(a.date));

  // --- HEALTH CARDS RENDERERS ---

  const renderSleepCard = () => {
    if (!latestSleepDay?.sleep) return null;
    const { asleepHours, inBedHours } = latestSleepDay.sleep;
    const goal = data.fitnessGoals.sleepGoal;
    
    // Color logic
    let color = '#5CB870'; // Green
    if (asleepHours < goal - 1) color = '#F85149'; // Red
    else if (asleepHours < goal) color = '#D29922'; // Yellow

    return (
        <Card title="SLEEP" action={<span className="text-[10px] font-mono text-textMuted bg-background/50 px-2 py-0.5 rounded">{formatDateLabel(latestSleepDay.date)}</span>} className="bg-card/50">
            <div className="flex justify-between items-end mb-3">
                <div>
                    <span className="text-4xl font-mono font-bold" style={{color}}>{asleepHours.toFixed(1)}h</span>
                    <span className="text-xs text-textSecondary ml-2">in bed {inBedHours.toFixed(1)}h</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-textSecondary uppercase block">{new Date(latestSleepDay.date).toLocaleDateString(undefined, {weekday: 'short'})}</span>
                </div>
            </div>
            {/* Mini Bar Chart */}
            <div className="flex items-end gap-1 h-8 mt-2">
                {recentSleeps.map((val, i) => (
                    <div key={i} className="flex-1 bg-border/30 rounded-t-sm relative group h-full flex items-end">
                        <div 
                            className="w-full rounded-t-sm transition-all"
                            style={{ 
                                height: `${Math.min(100, (val / 10) * 100)}%`,
                                backgroundColor: val >= goal ? '#5CB870' : val >= goal - 1 ? '#D29922' : '#F85149' 
                            }}
                        />
                    </div>
                ))}
            </div>
        </Card>
    );
  };

  const renderHeartCard = () => {
      if (!latestHeartDay) return null;
      const rhr = latestHeartDay.restingHR;
      const hrv = latestHeartDay.hrvAvg;
      
      if (rhr == null && hrv == null) return null;

      const rhrColor = !rhr ? '' : rhr < 60 ? 'text-primary' : rhr < 70 ? 'text-warning' : 'text-alert';
      const hrvColor = !hrv ? '' : hrv > 50 ? 'text-primary' : hrv > 30 ? 'text-warning' : 'text-alert';

      return (
          <Card className="bg-card/50 relative" action={<span className="text-[10px] font-mono text-textMuted bg-background/50 px-2 py-0.5 rounded">{formatDateLabel(latestHeartDay.date)}</span>} title="VITALS">
              <div className="flex divide-x divide-border/50">
                  <div className="flex-1 text-center pr-2">
                      <p className="text-[10px] text-textSecondary uppercase font-bold mb-1">RHR</p>
                      <p className={`text-2xl font-mono font-bold ${rhrColor}`}>
                          {rhr ? Math.round(rhr) : '--'} <span className="text-xs text-textSecondary font-normal">bpm</span>
                      </p>
                  </div>
                  <div className="flex-1 text-center pl-2">
                      <p className="text-[10px] text-textSecondary uppercase font-bold mb-1">HRV</p>
                      <p className={`text-2xl font-mono font-bold ${hrvColor}`}>
                          {hrv ? Math.round(hrv) : '--'} <span className="text-xs text-textSecondary font-normal">ms</span>
                      </p>
                  </div>
              </div>
          </Card>
      );
  };

  const renderStepsCard = () => {
      if (!latestStepsDay) return null;
      const steps = latestStepsDay.steps;
      const avg = recentSteps.length > 0 ? Math.round(recentSteps.reduce((a,b)=>a+b,0)/recentSteps.length) : 0;
      
      return (
        <Card title="STEPS" action={<span className="text-[10px] font-mono text-textMuted bg-background/50 px-2 py-0.5 rounded">{formatDateLabel(latestStepsDay.date)}</span>} className="bg-card/50">
            <div className="flex justify-between items-end mb-3">
                <div>
                    <span className="text-3xl font-mono font-bold text-white">{steps.toLocaleString()}</span>
                </div>
                <div className="text-right">
                    <span className="text-xs text-textSecondary font-medium">7-Day Avg</span>
                    <span className="block font-mono text-sm">{avg.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex items-end gap-1 h-6 mt-1">
                {recentSteps.map((val, i) => (
                    <div key={i} className="flex-1 bg-border/30 rounded-t-sm relative h-full flex items-end">
                        <div 
                            className="w-full bg-accent rounded-t-sm transition-all"
                            style={{ height: `${Math.min(100, (val / 15000) * 100)}%` }}
                        />
                    </div>
                ))}
            </div>
        </Card>
      );
  };

  const renderActivityCard = () => {
      if (!latestActivityDay) return null;
      return (
          <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-textSecondary font-mono uppercase tracking-widest">Recent Activity</span>
                  <span className="text-[10px] font-mono text-textMuted">{formatDateLabel(latestActivityDay.date)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                  <div className="bg-card border border-border rounded-lg p-2 text-center">
                      <p className="text-[10px] text-textSecondary uppercase">Move</p>
                      <p className="font-mono font-bold text-accent">{Math.round(latestActivityDay.activeCalories)} <span className="text-[10px]">cal</span></p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-2 text-center">
                      <p className="text-[10px] text-textSecondary uppercase">Exercise</p>
                      <p className="font-mono font-bold text-primary">{Math.round(latestActivityDay.exerciseMinutes)} <span className="text-[10px]">min</span></p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-2 text-center">
                      <p className="text-[10px] text-textSecondary uppercase">Stand</p>
                      <p className="font-mono font-bold text-info">{Math.round(latestActivityDay.standHours)} <span className="text-[10px]">hr</span></p>
                  </div>
              </div>
          </div>
      );
  };

  // ---

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* HEALTH IMPORT SECTION */}
      {hasHealthData ? (
          <div className="space-y-4">
             {renderSleepCard()}
             <div className="grid grid-cols-2 gap-4">
                 {renderHeartCard()}
                 {renderStepsCard()}
             </div>
             {renderActivityCard()}
          </div>
      ) : (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 flex justify-between items-center">
              <span className="text-xs text-accent font-medium">Import health data in Settings for automatic tracking.</span>
          </div>
      )}

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
              <h2 className="text-3xl font-mono font-bold text-white tracking-tighter">{allWeeklyWorkouts.length}</h2>
              <span className="text-xs text-textSecondary mb-1.5 font-medium uppercase tracking-wide">sessions this week</span>
          </div>

          <div className="space-y-3 pb-2">
              {allWeeklyWorkouts.map((workout) => {
                  const isImported = (workout as any).isImported;
                  return (
                    <div key={workout.id} className={`bg-card/50 border ${isImported ? 'border-accent/20' : 'border-border/50'} rounded-xl p-3 flex justify-between items-center shadow-sm hover:border-border transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`bg-background p-2.5 rounded-full border border-border/50 ${isImported ? 'text-accent' : 'text-textPrimary'}`}>
                                <Dumbbell size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-textPrimary">{workout.type}</p>
                                    {isImported && <span className="text-[9px] bg-accent/10 text-accent px-1.5 rounded uppercase font-bold">Imported</span>}
                                </div>
                                <p className="text-xs text-textSecondary mt-0.5 font-mono">{Math.round(workout.duration)} mins • {new Date(workout.date).toLocaleDateString(undefined, {weekday: 'short'})}</p>
                            </div>
                        </div>
                        {!isImported && (
                            <button onClick={() => confirmDeleteWorkout(workout.id)} className="text-textSecondary hover:text-alert p-2 rounded-lg transition-colors">
                                <span className="text-[10px] font-mono font-bold">DEL</span>
                            </button>
                        )}
                    </div>
                  );
              })}
              {allWeeklyWorkouts.length === 0 && (
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
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Manual Metrics">
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                      label="Recovery (%)"
                      type="number" inputMode="numeric"
                      value={manualForm.recovery} onChange={e => setManualForm({...manualForm, recovery: parseInt(e.target.value)||0})} 
                  />
                  <Input 
                      label="Strain (0-21)"
                      type="number" inputMode="decimal"
                      value={manualForm.strain} onChange={e => setManualForm({...manualForm, strain: parseFloat(e.target.value)||0})} 
                  />
                  <Input 
                      label="Calories Burned"
                      type="number" inputMode="numeric"
                      value={manualForm.caloriesBurned} onChange={e => setManualForm({...manualForm, caloriesBurned: parseInt(e.target.value)||0})} 
                  />
                  <Input 
                      label="RHR (bpm)"
                      type="number" inputMode="numeric"
                      value={manualForm.rhr} onChange={e => setManualForm({...manualForm, rhr: parseInt(e.target.value)||0})} 
                  />
                  <Input 
                      label="Hours Slept"
                      type="number" inputMode="decimal"
                      value={manualForm.hoursSlept} onChange={e => setManualForm({...manualForm, hoursSlept: parseFloat(e.target.value)||0})} 
                  />
                  <Input 
                      label="HRV (ms)"
                      type="number" inputMode="numeric"
                      value={manualForm.hrv} onChange={e => setManualForm({...manualForm, hrv: parseInt(e.target.value)||0})} 
                  />
              </div>
              <Button fullWidth onClick={handleManualUpdate} className="mt-2">SAVE METRICS</Button>
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
                  type="number" inputMode="decimal"
                  value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} 
              />
              
              <div>
                  <label className="block text-xs text-textSecondary mb-1.5 ml-1 font-medium">Notes</label>
                  <textarea 
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-base text-textPrimary placeholder:text-textMuted focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all outline-none h-24 resize-none"
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
                    API_KEY missing. Set it in Settings to enable parsing.
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
