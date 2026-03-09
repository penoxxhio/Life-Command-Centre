import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sun, Droplets, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlantSprite } from './components/PlantSprite';
import { PlantPicker } from './components/PlantPicker';
import { PlantDetail } from './components/PlantDetail';
import { GardenParticles } from './components/GardenParticles';
import type { GardenPlant } from '@/types';

export const GardenPage: React.FC = () => {
  const { garden, setGarden } = useAppStore();
  const [showPlantPicker, setShowPlantPicker] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);

  const plants = garden.plants ?? [];
  const sunlight = garden.sunlight ?? 0;
  const water = garden.water ?? 0;
  const level = garden.level ?? 1;

  const handlePlant = (type: string, name: string) => {
    const newPlant: GardenPlant = {
      id: Date.now().toString(),
      type,
      name,
      health: 100,
      growthStage: 0,
      xp: 0,
      sunlight: 0,
      water: 0,
      plantedAt: new Date().toISOString(),
    };
    setGarden({ plants: [...plants, newPlant] });
    setShowPlantPicker(false);
  };

  const handleWater = () => {
    if (!selectedPlant || water <= 0) return;
    const updated = plants.map((p) =>
      p.id === selectedPlant.id
        ? { ...p, health: Math.min(100, (p.health ?? 0) + 10), water: (p.water ?? 0) + 1, xp: (p.xp ?? 0) + 5 }
        : p
    );
    setGarden({ plants: updated, water: water - 1 });
    setSelectedPlant(updated.find((p) => p.id === selectedPlant.id) ?? null);
  };

  const handleRemove = () => {
    if (!selectedPlant) return;
    setGarden({ plants: plants.filter((p) => p.id !== selectedPlant.id) });
    setSelectedPlant(null);
  };

  // Determine particle type based on resources
  const particleType = sunlight > water ? 'sunlight' : water > 0 ? 'rain' : 'sparkle';

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">
      {/* Header Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-gradient-to-b from-amber-50 to-cream-50">
          <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-earth-900">{sunlight}</p>
          <p className="text-xs text-earth-500">Sunlight</p>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-b from-sky-50 to-cream-50">
          <Droplets className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-earth-900">{water}</p>
          <p className="text-xs text-earth-500">Water</p>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-b from-sage-50 to-cream-50">
          <Sparkles className="w-5 h-5 text-sage-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-earth-900">Lv.{level}</p>
          <p className="text-xs text-earth-500">Garden</p>
        </Card>
      </motion.div>

      {/* Garden Bed */}
      <motion.div variants={item}>
        <Card className="relative overflow-hidden min-h-[320px] bg-gradient-to-b from-sky-100 via-cream-50 to-amber-50 border-sage-200">
          {/* Particles */}
          <GardenParticles count={8} type={particleType} />

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-200/50 to-transparent" />

          {plants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🌱
              </motion.div>
              <p className="text-earth-500 text-sm mb-4">Your garden is empty</p>
              <Button variant="warm" onClick={() => setShowPlantPicker(true)} icon={<Plus className="w-4 h-4" />}>
                Plant Your First Seed
              </Button>
            </div>
          ) : (
            <div className="relative p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 justify-items-center">
                <AnimatePresence>
                  {plants.map((plant) => (
                    <motion.div
                      key={plant.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <PlantSprite
                        plant={plant}
                        size="md"
                        onClick={() => setSelectedPlant(plant)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Plant count */}
      <motion.div variants={item} className="flex items-center justify-between">
        <p className="text-sm text-earth-500">{plants.length} plant{plants.length !== 1 ? 's' : ''} in your garden</p>
        {plants.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowPlantPicker(true)} icon={<Plus className="w-4 h-4" />}>
            Add Plant
          </Button>
        )}
      </motion.div>

      {/* Plant Picker Modal */}
      <Modal isOpen={showPlantPicker} onClose={() => setShowPlantPicker(false)} title="Plant a Seed">
        <PlantPicker onSelect={handlePlant} onCancel={() => setShowPlantPicker(false)} />
      </Modal>

      {/* Plant Detail Modal */}
      <Modal isOpen={!!selectedPlant} onClose={() => setSelectedPlant(null)} title={selectedPlant?.name || 'Plant Details'}>
        {selectedPlant && (
          <PlantDetail
            plant={selectedPlant}
            onWater={handleWater}
            onRemove={handleRemove}
            onClose={() => setSelectedPlant(null)}
          />
        )}
      </Modal>
    </motion.div>
  );
};
