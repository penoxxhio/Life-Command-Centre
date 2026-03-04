import React, { useState, useRef } from 'react';
import { AppData, Meal } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { parseMealLog, analyzeFoodImage, refineMealLog, isAiReady } from '../services/geminiService';
import { Trash2, Sparkles, Camera, RotateCw, Send, Plus, Download, AlertCircle } from 'lucide-react';
import { exportData } from '../services/storageService';
import { motion } from 'motion/react';

interface NutritionProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
}

export const NutritionPage: React.FC<NutritionProps> = ({ data, updateData }) => {
  const [mealInput, setMealInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiAvailable = isAiReady();

  // Confirmation State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<Partial<Meal> | null>(null);
  const [refinementText, setRefinementText] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Delete Confirm State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysMeals = data.meals.filter(m => m.date === todayStr);

  // Totals
  const totalCals = todaysMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalPro = todaysMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarb = todaysMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = todaysMeals.reduce((sum, m) => sum + m.fats, 0);
  
  const handleAiLog = async () => {
    if (!mealInput || !aiAvailable) return;
    setIsAnalyzing(true);
    const result = await parseMealLog(mealInput);
    setIsAnalyzing(false);

    if (result) {
      setPendingMeal(result);
      setShowConfirmModal(true);
      setMealInput('');
    } else {
      alert("AI couldn't analyze that. Try again.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !aiAvailable) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeFoodImage(base64String, file.type);
      setIsAnalyzing(false);
      
      if (result) {
        setPendingMeal(result);
        setShowConfirmModal(true);
      } else {
        alert("Could not analyze image.");
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRefine = async () => {
    if (!pendingMeal || !refinementText || !aiAvailable) return;
    setIsRefining(true);
    const refined = await refineMealLog(pendingMeal, refinementText);
    setIsRefining(false);
    
    if (refined) {
      setPendingMeal(refined);
      setRefinementText('');
    }
  };

  const handleConfirmLog = () => {
    if (!pendingMeal) return;
    
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      date: todayStr,
      timestamp: Date.now(),
      name: pendingMeal.name || 'Unknown Meal',
      isAiEstimated: true,
      calories: pendingMeal.calories || 0,
      protein: pendingMeal.protein || 0,
      carbs: pendingMeal.carbs || 0,
      fats: pendingMeal.fats || 0,
      fiber: pendingMeal.fiber || 0,
      sugar: pendingMeal.sugar || 0,
      saturatedFat: pendingMeal.saturatedFat || 0,
      sodium: pendingMeal.sodium || 0,
      cholesterol: pendingMeal.cholesterol || 0,
      potassium: pendingMeal.potassium || 0,
      iron: pendingMeal.iron || 0,
      calcium: pendingMeal.calcium || 0,
      vitaminD: pendingMeal.vitaminD || 0
    };

    updateData({ meals: [newMeal, ...data.meals] });
    setShowConfirmModal(false);
    setPendingMeal(null);
  };

  const confirmDeleteMeal = (id: string) => {
    setConfirmConfig({
        isOpen: true,
        title: 'Delete Meal',
        message: 'Are you sure you want to delete this meal log?',
        onConfirm: () => {
            updateData({ meals: data.meals.filter(m => m.id !== id) });
        }
    });
  };

  const quickChipAdd = (item: string) => {
    setMealInput(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      
      {/* 1. Daily Summary */}
      <Card title="MACRO TARGETS" action={
          <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => exportData(data, 'file', 'nutrition')}>
            <Download size={14} />
          </Button>
      }>
        <div className="grid grid-cols-4 gap-2 text-center mb-4">
           <div className="bg-background/40 p-2 rounded-lg border border-border/50">
             <p className="text-xs text-textSecondary">Cals</p>
             <p className="font-mono font-bold text-white">{Math.round(totalCals)}</p>
           </div>
           <div className="bg-background/40 p-2 rounded-lg border border-border/50">
             <p className="text-xs text-textSecondary">Pro</p>
             <p className="font-mono font-bold text-primary">{Math.round(totalPro)}g</p>
           </div>
           <div className="bg-background/40 p-2 rounded-lg border border-border/50">
             <p className="text-xs text-textSecondary">Carb</p>
             <p className="font-mono font-bold text-warning">{Math.round(totalCarb)}g</p>
           </div>
           <div className="bg-background/40 p-2 rounded-lg border border-border/50">
             <p className="text-xs text-textSecondary">Fat</p>
             <p className="font-mono font-bold text-alert">{Math.round(totalFat)}g</p>
           </div>
        </div>
        <div className="space-y-2">
           <ProgressBar value={totalCals} max={data.fitnessGoals.calorieGoal} color="#A371F7" className="h-1.5" />
           <div className="flex justify-between text-[10px] text-textSecondary">
              <span>{Math.round((totalCals / data.fitnessGoals.calorieGoal) * 100)}% CONSUMED</span>
              <span>GOAL: {data.fitnessGoals.calorieGoal}</span>
           </div>
        </div>
      </Card>

      {/* 2. AI Logger */}
      <Card title="AI FOOD LOGGER">
        {!aiAvailable && (
          <div className="bg-alert/10 border border-alert/20 rounded-lg p-3 mb-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-alert shrink-0" />
            <p className="text-[11px] text-alert font-medium leading-tight">
              AI Features Disabled: API_KEY not found in environment. Set it in Netlify settings to enable.
            </p>
          </div>
        )}
        <div className="flex gap-2 mb-3">
           <div className="relative flex-1">
             <input 
                className={`w-full bg-background/50 border border-border rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-accent/50 outline-none ${!aiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={aiAvailable ? "e.g. 2 eggs and toast..." : "AI Features Unavailable"}
                value={mealInput}
                onChange={e => setMealInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiLog()}
                disabled={!aiAvailable}
             />
             <button 
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-accent hover:text-white p-1 ${!aiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleAiLog}
                disabled={isAnalyzing || !aiAvailable}
             >
                {isAnalyzing ? <RotateCw className="animate-spin" size={18}/> : <Send size={18}/>}
             </button>
           </div>
           <button 
             className={`bg-card border border-border hover:bg-border text-textSecondary hover:text-white w-12 rounded-lg flex items-center justify-center transition-colors ${!aiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
             onClick={() => aiAvailable && fileInputRef.current?.click()}
             disabled={!aiAvailable}
           >
             <Camera size={20} />
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*"
             capture="environment" 
             onChange={handleImageUpload}
           />
        </div>
        
        {/* Quick Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {data.nutritionQuickChips.map((chip, idx) => (
             <button 
               key={idx}
               onClick={() => aiAvailable && quickChipAdd(chip)}
               disabled={!aiAvailable}
               className={`whitespace-nowrap bg-background/30 border border-border/50 text-xs px-3 py-1.5 rounded-full hover:bg-accent/20 hover:text-accent transition-colors ${!aiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {chip}
             </button>
           ))}
        </div>
      </Card>

      {/* 3. Daily Log */}
      <div className="pb-4">
        <h3 className="text-textSecondary font-mono text-[10px] uppercase tracking-widest mb-3 ml-1">Today's Meals</h3>
        <div className="space-y-3">
          {todaysMeals.map((meal) => (
            <div key={meal.id} className="bg-card border border-border/50 rounded-xl p-3 flex justify-between items-center shadow-sm">
              <div className="flex-1">
                 <div className="flex items-center gap-2">
                   <p className="font-bold text-sm text-textPrimary">{meal.name}</p>
                   {meal.isAiEstimated && <Sparkles size={10} className="text-ai" />}
                 </div>
                 <p className="text-xs text-textSecondary mt-0.5 font-mono">
                   {Math.round(meal.calories)} cal • {Math.round(meal.protein)}p • {Math.round(meal.carbs)}c • {Math.round(meal.fats)}f
                 </p>
              </div>
              <button 
                onClick={() => confirmDeleteMeal(meal.id)}
                className="text-textSecondary hover:text-alert transition-colors p-3"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {todaysMeals.length === 0 && (
            <div className="text-center py-8 bg-card/30 rounded-xl border border-dashed border-border/50">
              <p className="text-textSecondary text-xs">No food logged yet today.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
      />

      {/* Confirm Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Meal">
         {pendingMeal && (
           <div className="space-y-4">
              <div className="bg-card/50 p-4 rounded-lg border border-border/50 text-center space-y-2">
                 <h3 className="text-lg font-bold text-white">{pendingMeal.name}</h3>
                 <div className="flex justify-center gap-4 text-sm font-mono">
                    <div className="text-white font-bold">{pendingMeal.calories} <span className="text-[10px] font-normal text-textSecondary">KCAL</span></div>
                    <div className="text-primary font-bold">{pendingMeal.protein} <span className="text-[10px] font-normal text-textSecondary">PRO</span></div>
                    <div className="text-warning font-bold">{pendingMeal.carbs} <span className="text-[10px] font-normal text-textSecondary">CARB</span></div>
                    <div className="text-alert font-bold">{pendingMeal.fats} <span className="text-[10px] font-normal text-textSecondary">FAT</span></div>
                 </div>
              </div>

              {/* Refinement Input */}
              <div className="flex gap-2">
                 <input 
                   className="flex-1 bg-background/50 border border-border rounded px-3 py-2 text-xs"
                   placeholder="Wrong? e.g. 'Add 1 more egg' or 'Less rice'"
                   value={refinementText}
                   onChange={e => setRefinementText(e.target.value)}
                 />
                 <button 
                    onClick={handleRefine} 
                    disabled={isRefining}
                    className="bg-ai/20 text-ai border border-ai/50 px-3 rounded hover:bg-ai/30"
                 >
                    {isRefining ? <RotateCw className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                 <Input label="Name" value={pendingMeal.name} onChange={e => setPendingMeal({...pendingMeal, name: e.target.value})} />
                 <Input label="Calories" type="number" value={pendingMeal.calories} onChange={e => setPendingMeal({...pendingMeal, calories: parseFloat(e.target.value)})} />
                 <Input label="Protein" type="number" value={pendingMeal.protein} onChange={e => setPendingMeal({...pendingMeal, protein: parseFloat(e.target.value)})} />
                 <Input label="Carbs" type="number" value={pendingMeal.carbs} onChange={e => setPendingMeal({...pendingMeal, carbs: parseFloat(e.target.value)})} />
                 <Input label="Fats" type="number" value={pendingMeal.fats} onChange={e => setPendingMeal({...pendingMeal, fats: parseFloat(e.target.value)})} />
              </div>

              <Button fullWidth onClick={handleConfirmLog}>LOG MEAL</Button>
           </div>
         )}
      </Modal>

    </motion.div>
  );
};