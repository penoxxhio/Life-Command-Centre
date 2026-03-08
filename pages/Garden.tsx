import React, { useState } from 'react';
import { AppData, GardenPlot, PlantType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { 
  PLANT_CATALOG, PLANT_TYPES, getPlantEmoji, getHealthColor, 
  getHealthLabel, createPlant 
} from '../services/gardenService';
import { Sprout, Droplets, Skull, Lock, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface GardenProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
}

export const GardenPage: React.FC<GardenProps> = ({ data, updateData }) => {
  const [selectedPlot, setSelectedPlot] = useState<GardenPlot | null>(null);
  const [showPlantPicker, setShowPlantPicker] = useState(false);
  const [plantingPlotId, setPlantingPlotId] = useState<string | null>(null);

  const garden = data.gardenData;
  const alivePlants = garden.plots.filter(p => p.plant && !p.plant.isDead).length;
  const nextLevelXP = garden.gardenLevel * 200;
  const currentLevelXP = (garden.gardenLevel - 1) * 200;
  const levelProgress = garden.lifetimeXP - currentLevelXP;
  const levelNeeded = nextLevelXP - currentLevelXP;

  const handlePlotTap = (plot: GardenPlot) => {
    if (!plot.unlocked) return;
    if (!plot.plant) {
      setPlantingPlotId(plot.id);
      setShowPlantPicker(true);
    } else {
      setSelectedPlot(plot);
    }
  };

  const handlePlant = (type: PlantType) => {
    if (!plantingPlotId) return;
    const newPlant = createPlant(type);
    const updatedPlots = garden.plots.map(p => 
      p.id === plantingPlotId ? { ...p, plant: newPlant } : p
    );
    updateData({ 
      gardenData: { ...garden, plots: updatedPlots } 
    });
    setShowPlantPicker(false);
    setPlantingPlotId(null);
  };

  const handleRemovePlant = (plotId: string) => {
    const updatedPlots = garden.plots.map(p => 
      p.id === plotId ? { ...p, plant: null } : p
    );
    updateData({ gardenData: { ...garden, plots: updatedPlots } });
    setSelectedPlot(null);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      
      {/* Garden Header Stats */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-[#0d2818] to-[#0D1117] border-primary/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sprout size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-textPrimary">My Garden</h2>
              </div>
              <p className="text-textSecondary text-xs font-mono">
                Level {garden.gardenLevel} • {alivePlants} plant{alivePlants !== 1 ? 's' : ''} alive
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-primary">{garden.lifetimeXP}</div>
              <div className="text-[10px] text-textSecondary font-mono">TOTAL XP</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-textSecondary font-mono">
              <span>LVL {garden.gardenLevel}</span>
              <span>LVL {garden.gardenLevel + 1}</span>
            </div>
            <ProgressBar value={levelProgress} max={levelNeeded} color="#2EA043" className="h-2" />
            <div className="text-[10px] text-textSecondary font-mono text-center mt-1">
              {levelNeeded - levelProgress} XP to next level
            </div>
          </div>
        </Card>
      </motion.div>

      {/* How it works hint (only if no plants) */}
      {alivePlants === 0 && garden.totalPlantsGrown === 0 && (
        <motion.div variants={item}>
          <Card className="bg-card/50 border-border/50">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-ai mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-textPrimary mb-1">Your actions grow your garden</p>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Every expense you log, debt payment you make, and meal you track waters your plants and gives them XP. 
                  Skip a few days and they start wilting. Tap an empty plot to plant your first seed!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Garden Grid */}
      <motion.div variants={item}>
        <div className="grid grid-cols-3 gap-3">
          {garden.plots.map((plot, idx) => {
            const plant = plot.plant;
            const isLocked = !plot.unlocked;
            const isEmpty = !plant && !isLocked;
            const isDead = plant?.isDead;
            
            return (
              <motion.button
                key={plot.id}
                whileTap={{ scale: isLocked ? 1 : 0.92 }}
                onClick={() => handlePlotTap(plot)}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                  isLocked
                    ? 'bg-background/30 border-border/30 cursor-not-allowed opacity-40'
                    : isEmpty
                    ? 'bg-card/50 border-border/50 border-dashed hover:border-primary/50'
                    : isDead
                    ? 'bg-card border-alert/30'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                {isLocked && (
                  <Lock size={20} className="text-textMuted" />
                )}
                
                {isEmpty && (
                  <>
                    <span className="text-2xl mb-1 opacity-30">+</span>
                    <span className="text-[9px] text-textMuted font-mono">PLANT</span>
                  </>
                )}
                
                {plant && (
                  <>
                    <span className="text-3xl mb-1" style={{ 
                      filter: isDead ? 'grayscale(0.5)' : 'none',
                    }}>
                      {getPlantEmoji(plant)}
                    </span>
                    
                    {!isDead && (
                      <div className="w-full px-2">
                        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${plant.health}%`,
                              backgroundColor: getHealthColor(plant.health)
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {isDead && (
                      <span className="text-[9px] text-alert font-mono mt-1">DEAD</span>
                    )}
                  </>
                )}
                
                {/* Glow effect for healthy plants */}
                {plant && !isDead && plant.health > 70 && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ 
                      boxShadow: `inset 0 0 20px ${getHealthColor(plant.health)}15`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Garden Stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/50 text-center py-3 px-2">
            <TrendingUp size={14} className="text-primary mx-auto mb-1" />
            <div className="font-mono font-bold text-textPrimary">{garden.totalPlantsGrown}</div>
            <div className="text-[9px] text-textSecondary font-mono">MATURED</div>
          </Card>
          <Card className="bg-card/50 text-center py-3 px-2">
            <Heart size={14} className="text-info mx-auto mb-1" />
            <div className="font-mono font-bold text-textPrimary">{alivePlants}</div>
            <div className="text-[9px] text-textSecondary font-mono">ALIVE</div>
          </Card>
          <Card className="bg-card/50 text-center py-3 px-2">
            <Skull size={14} className="text-alert mx-auto mb-1" />
            <div className="font-mono font-bold text-textPrimary">{garden.totalPlantsDied}</div>
            <div className="text-[9px] text-textSecondary font-mono">LOST</div>
          </Card>
        </div>
      </motion.div>

      {/* Action Guide */}
      <motion.div variants={item}>
        <Card className="bg-card/50 border-border/50">
          <h3 className="text-textSecondary font-mono text-[11px] uppercase tracking-wider mb-3">How Plants Grow</h3>
          <div className="space-y-2.5">
            {[
              { emoji: '💸', label: 'Log an expense', xp: '+8 XP' },
              { emoji: '💳', label: 'Make a debt payment', xp: '+20 XP' },
              { emoji: '🍽️', label: 'Log a meal', xp: '+8 XP' },
              { emoji: '💪', label: 'Log a workout', xp: '+12 XP' },
              { emoji: '💰', label: 'Log income', xp: '+5 XP' },
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{action.emoji}</span>
                  <span className="text-xs text-textSecondary">{action.label}</span>
                </div>
                <span className="text-xs font-mono font-bold text-primary">{action.xp}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-2.5">
                <span className="text-sm">⚠️</span>
                <span className="text-xs text-textSecondary">Skip a day</span>
              </div>
              <span className="text-xs font-mono font-bold text-alert">-12 HP</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Plant Picker Modal */}
      <Modal isOpen={showPlantPicker} onClose={() => setShowPlantPicker(false)} title="Choose a Plant">
        <div className="grid grid-cols-2 gap-3">
          {PLANT_TYPES.map(type => {
            const info = PLANT_CATALOG[type];
            return (
              <button
                key={type}
                onClick={() => handlePlant(type)}
                className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 active:scale-95 transition-all"
              >
                <span className="text-3xl">{info.emoji.mature}</span>
                <span className="text-sm font-bold text-textPrimary">{info.name}</span>
                <span className="text-[10px] text-textSecondary">{info.description}</span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Plant Detail Modal */}
      <Modal 
        isOpen={!!selectedPlot?.plant} 
        onClose={() => setSelectedPlot(null)} 
        title={selectedPlot?.plant?.name || 'Plant Details'}
      >
        {selectedPlot?.plant && (() => {
          const plant = selectedPlot.plant;
          const info = PLANT_CATALOG[plant.type];
          const plantedDate = new Date(plant.plantedDate);
          const daysSincePlanted = Math.floor((Date.now() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div className="space-y-5">
              <div className="text-center">
                <span className="text-6xl block mb-3" style={{ filter: plant.isDead ? 'grayscale(0.5)' : 'none' }}>
                  {getPlantEmoji(plant)}
                </span>
                <h3 className="text-lg font-bold text-textPrimary">{info.name}</h3>
                <p className="text-xs text-textSecondary capitalize">{plant.stage} • Day {daysSincePlanted}</p>
              </div>

              {!plant.isDead ? (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-textSecondary flex items-center gap-1">
                        <Droplets size={12} /> Health
                      </span>
                      <span style={{ color: getHealthColor(plant.health) }} className="font-mono font-bold">
                        {Math.round(plant.health)}% — {getHealthLabel(plant.health)}
                      </span>
                    </div>
                    <ProgressBar value={plant.health} max={100} color={getHealthColor(plant.health)} className="h-2.5" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-textSecondary">Experience</span>
                      <span className="font-mono font-bold text-primary">{plant.experience} XP</span>
                    </div>
                    <ProgressBar value={plant.experience} max={130} color="#2EA043" className="h-2" />
                    <div className="flex justify-between text-[10px] text-textMuted font-mono mt-1">
                      <span>Seed</span><span>Sprout</span><span>Grow</span><span>Bloom</span><span>Mature</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <div className="text-textSecondary text-[10px] font-mono mb-1">PLANTED</div>
                      <div className="text-sm font-bold text-textPrimary">{plantedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <div className="text-textSecondary text-[10px] font-mono mb-1">LAST CARED</div>
                      <div className="text-sm font-bold text-textPrimary">{new Date(plant.lastCaredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-alert text-sm font-bold mb-1">This plant has died</p>
                  <p className="text-textSecondary text-xs">It wasn't cared for enough. Remove it and plant something new.</p>
                </div>
              )}

              <Button 
                variant={plant.isDead ? 'secondary' : 'danger'} 
                fullWidth 
                onClick={() => handleRemovePlant(selectedPlot.id)}
              >
                {plant.isDead ? 'Clear Plot' : 'Remove Plant'}
              </Button>
            </div>
          );
        })()}
      </Modal>
    </motion.div>
  );
};
