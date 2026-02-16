
import React, { useState, useEffect } from 'react';
import { AppData, Tab } from '../types';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowRight, Flame, Moon, Target, Footprints } from 'lucide-react';
import { getLatestSleep, getHealthDay } from '../services/healthImportService';

interface HomeProps {
  data: AppData;
  onNavigate: (tab: Tab) => void;
}

export const HomePage: React.FC<HomeProps> = ({ data, onNavigate }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Load Health Data
  const importedToday = getHealthDay(todayStr);
  const latestSleep = getLatestSleep();

  // 1. Debt Logic
  const totalDebtStart = data.debtGoal.startingTotal;
  const currentTotalDebt = data.debtAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const debtPaid = Math.max(0, totalDebtStart - currentTotalDebt);
  const debtProgress = Math.min(100, (debtPaid / totalDebtStart) * 100);
  
  const today = new Date();
  const targetDate = new Date(data.debtGoal.targetDate);
  const diffTime = Math.abs(targetDate.getTime() - today.getTime());
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 2. Auto-Tracked Logic
  const todaysMeals = data.meals.filter(m => m.date === todayStr);
  const todaysProtein = todaysMeals.reduce((sum, m) => sum + m.protein, 0);
  const proteinGoal = data.fitnessGoals.proteinGoal;
  const proteinMet = todaysProtein >= proteinGoal;
  
  // Sleep logic (Prefer Imported)
  const sleepHours = latestSleep?.asleepHours || data.whoopData.hoursSlept;
  const sleepGoal = data.fitnessGoals.sleepGoal;
  
  // Training logic (Merge manual + imported)
  const dayOfWeek = today.getDay(); 
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  
  const manualWorkoutsCount = data.workouts.filter(w => w.date >= startOfWeekStr && w.completed).length;
  // TODO: Add imported count if needed, but simple manual count is okay for home quick view for now
  // or use new service logic if implemented. For home summary, manual is often enough if syncing.
  const weeklyWorkouts = manualWorkoutsCount; 

  const workoutTarget = data.fitnessGoals.weeklySessionTarget;

  // Recovery
  const recovery = data.whoopData.recovery;
  const getRecoveryColor = (val: number) => {
    if (val > 66) return 'text-primary';
    if (val > 33) return 'text-warning';
    return 'text-alert';
  };

  // 3. Calories Logic
  const todaysCalories = todaysMeals.reduce((sum, m) => sum + m.calories, 0);
  const calorieGoal = data.fitnessGoals.calorieGoal;
  const caloriesBurned = data.whoopData.caloriesBurned;
  
  const todaysCarbs = todaysMeals.reduce((sum, m) => sum + m.carbs, 0);
  const todaysFats = todaysMeals.reduce((sum, m) => sum + m.fats, 0);

  // 4. Budget Logic
  const payday = data.budgetConfig.cycleStartDay;
  let cycleStart = new Date(today.getFullYear(), today.getMonth(), payday);
  if (today.getDate() < payday) {
    cycleStart = new Date(today.getFullYear(), today.getMonth() - 1, payday);
  }
  const cycleStartStr = cycleStart.toISOString().split('T')[0];
  
  let nextPaydayDate = new Date(today.getFullYear(), today.getMonth(), payday);
  if (today.getDate() >= payday) {
    nextPaydayDate = new Date(today.getFullYear(), today.getMonth() + 1, payday);
  }
  const daysUntilPayday = Math.ceil((nextPaydayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const livingBudgetTotal = data.budgetConfig.livingCategories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const expensesThisCycle = data.expenses.filter(e => e.date >= cycleStartStr);
  const spentThisCycle = expensesThisCycle.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = livingBudgetTotal - spentThisCycle;
  const dailyAvailable = daysUntilPayday > 0 ? remainingBudget / daysUntilPayday : 0;

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* Section 1: Hero Card (Debt and Credit Cards) */}
      <Card 
        className="bg-gradient-to-br from-[#161B22] to-[#0D1117] border-border shadow-lg relative overflow-hidden group"
        onClick={() => onNavigate(Tab.MONEY)}
      >
        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={16} className="text-textSecondary" />
        </div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-accent font-bold text-lg mb-1 tracking-tight">Debt and Credit Cards</h2>
            <p className="text-textSecondary text-xs font-medium">{daysRemaining} days remaining</p>
          </div>
          <div className="w-16 h-16 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[{ val: debtProgress }, { val: 100 - debtProgress }]}
                   innerRadius={22}
                   outerRadius={28}
                   startAngle={90}
                   endAngle={-270}
                   dataKey="val"
                   stroke="none"
                   cornerRadius={4}
                   paddingAngle={5}
                 >
                   <Cell fill="#2EA043" />
                   <Cell fill="#30363D" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-textPrimary">
               {Math.round(debtProgress)}%
             </div>
          </div>
        </div>

        <div className="flex justify-between text-sm mb-4">
           <div>
              <p className="text-textSecondary text-[10px] font-mono uppercase tracking-wider mb-0.5">Paid</p>
              <p className="font-mono font-bold text-primary">{Math.round(debtPaid).toLocaleString()}</p>
           </div>
           <div className="text-right">
              <p className="text-textSecondary text-[10px] font-mono uppercase tracking-wider mb-0.5">Left</p>
              <p className="font-mono font-bold text-white">{Math.round(currentTotalDebt).toLocaleString()}</p>
           </div>
        </div>

        <ProgressBar value={debtPaid} max={totalDebtStart} color="#2EA043" className="h-2.5" />
      </Card>

      {/* Section 2: Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card onClick={() => onNavigate(Tab.NUTRITION)} className="bg-card/50 hover:bg-card transition-colors">
           <div className="flex justify-between items-start mb-3">
             <Flame size={16} className="text-warning" />
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${proteinMet ? 'bg-primary/20 text-primary' : 'bg-border text-textSecondary'}`}>
               {proteinMet ? 'HIT' : 'WIP'}
             </span>
           </div>
           <p className="text-textSecondary text-xs mb-0.5">Protein</p>
           <p className="font-mono font-bold text-xl text-textPrimary">{Math.round(todaysProtein)}<span className="text-xs text-textSecondary font-normal">/{proteinGoal}g</span></p>
        </Card>

        <Card onClick={() => onNavigate(Tab.FITNESS)} className="bg-card/50 hover:bg-card transition-colors">
           <div className="flex justify-between items-start mb-3">
             <Moon size={16} className="text-info" />
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sleepHours >= sleepGoal ? 'bg-primary/20 text-primary' : 'bg-border text-textSecondary'}`}>
               {sleepHours >= sleepGoal ? 'HIT' : 'LOW'}
             </span>
           </div>
           <p className="text-textSecondary text-xs mb-0.5">Sleep</p>
           <p className="font-mono font-bold text-xl text-textPrimary">{sleepHours.toFixed(1)}<span className="text-xs text-textSecondary font-normal">/{sleepGoal}h</span></p>
        </Card>

        <Card onClick={() => onNavigate(Tab.FITNESS)} className="bg-card/50 hover:bg-card transition-colors">
           <div className="flex justify-between items-start mb-3">
             <Target size={16} className="text-accent" />
             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${weeklyWorkouts >= workoutTarget ? 'bg-primary/20 text-primary' : 'bg-border text-textSecondary'}`}>
               {weeklyWorkouts}/{workoutTarget}
             </span>
           </div>
           <p className="text-textSecondary text-xs mb-0.5">Training</p>
           <p className="font-mono font-bold text-xl text-textPrimary">{weeklyWorkouts >= workoutTarget ? 'DONE' : 'PUSH'}</p>
        </Card>

        {importedToday?.steps ? (
             <Card onClick={() => onNavigate(Tab.FITNESS)} className="bg-card/50 hover:bg-card transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <Footprints size={16} className="text-primary" />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-border text-textSecondary`}>
                    TODAY
                  </span>
                </div>
                <p className="text-textSecondary text-xs mb-0.5">Steps</p>
                <p className="font-mono font-bold text-xl text-textPrimary">{importedToday.steps.toLocaleString()}</p>
             </Card>
        ) : (
             <Card onClick={() => onNavigate(Tab.FITNESS)} className="bg-card/50 hover:bg-card transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-lg">🔋</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-border text-textSecondary`}>
                    WHOOP
                  </span>
                </div>
                <p className="text-textSecondary text-xs mb-0.5">Recovery</p>
                <p className={`font-mono font-bold text-xl ${getRecoveryColor(recovery)}`}>
                  {recovery > 0 ? `${recovery}%` : '--'}
                </p>
             </Card>
        )}
      </div>

      {/* Section 3: Daily Nutrition */}
      <Card title="ENERGY BALANCE" onClick={() => onNavigate(Tab.NUTRITION)}>
         <div className="flex justify-between items-end mb-4">
            <div>
                <span className="text-2xl font-mono font-bold">{Math.round(todaysCalories)}</span>
                <span className="text-xs text-textSecondary ml-1">kcal in</span>
            </div>
            <div className="text-right">
                <span className="text-2xl font-mono font-bold text-textMuted">{Math.round(caloriesBurned)}</span>
                <span className="text-xs text-textSecondary ml-1">kcal out</span>
            </div>
         </div>
         <div className="relative h-3 bg-border rounded-full overflow-hidden mb-6">
            <div className="absolute top-0 left-0 h-full bg-ai" style={{ width: `${Math.min(100, (todaysCalories / calorieGoal) * 100)}%` }}></div>
         </div>

         <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-textSecondary">
                <span>PRO</span> <span>{Math.round(todaysProtein)}g</span>
              </div>
              <ProgressBar value={todaysProtein} max={proteinGoal} color="#5CB870" className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-textSecondary">
                <span>CARB</span> <span>{Math.round(todaysCarbs)}g</span>
              </div>
              <ProgressBar value={todaysCarbs} max={data.fitnessGoals.carbGoal} color="#D29922" className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-textSecondary">
                <span>FAT</span> <span>{Math.round(todaysFats)}g</span>
              </div>
              <ProgressBar value={todaysFats} max={data.fitnessGoals.fatGoal} color="#F85149" className="h-1.5" />
            </div>
         </div>
      </Card>

      {/* Section 4: Budget */}
      <Card title="MONTHLY SPEND" onClick={() => onNavigate(Tab.MONEY)}>
         <div className="flex justify-between items-center mb-4">
           <div>
             <p className={`text-2xl font-mono font-bold ${remainingBudget < 0 ? 'text-alert' : 'text-primary'}`}>
               {Math.round(remainingBudget)} <span className="text-xs text-textSecondary font-sans font-normal">{data.userProfile.currency} Left</span>
             </p>
           </div>
           <div className="bg-card border border-border px-3 py-1.5 rounded-lg text-center">
             <p className="text-[10px] text-textSecondary uppercase">Daily Safe</p>
             <p className="font-mono font-bold text-info">{Math.round(dailyAvailable)}</p>
           </div>
         </div>
         <ProgressBar value={spentThisCycle} max={livingBudgetTotal} color="#58A6FF" className="mb-2 h-2.5" />
         <div className="flex justify-between text-[10px] text-textSecondary font-mono mt-2">
           <span>{Math.round(spentThisCycle)} SPENT</span>
           <span>{daysUntilPayday} DAYS TO PAYDAY</span>
         </div>
      </Card>

    </div>
  );
};
