import { useAppStore } from '@/store/useAppStore';
import { PLANT_CONFIG, GROWTH_STAGES, STAGE_ORDER } from '@/constants';
import { PlantSprite } from './components/PlantSprite';
import type { GardenPlant, PlantType, GardenActionType } from '@/types';
import { processGardenAction, processGardenDailyDecay } from '@/services/gardenService';

export function GardenPage() {
  const { data, updateGarden } = useAppStore();
  const garden = data.garden;

  const handlePlantSeed = (plotId: number, plantType: PlantType) => {
    const newPlant: GardenPlant = {
      id: Date.now().toString(),
      type: plantType,
      name: PLANT_CONFIG[plantType].name,
      stage: 'seed',
      growthStage: 0,
      health: 100,
      xp: 0,
      sunlight: 5,
      water: 5,
      plantedDate: new Date().toISOString(),
      plantedAt: new Date().toISOString(),
    };

    const updatedPlots = garden.plots.map((plot) =>
      plot.id === plotId ? { ...plot, plant: newPlant } : plot
    );
    const updatedPlants = [...garden.plants, newPlant];
    updateGarden({ ...garden, plots: updatedPlots, plants: updatedPlants });
  };

  const handleAction = (plantId: string, action: GardenActionType) => {
    const result = processGardenAction(garden, action);
    updateGarden(result.garden);
  };

  return (
    <div className="space-y-6">
      {/* Garden Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-garden p-3 shadow-garden text-center">
          <p className="text-2xl font-bold text-sage">{garden.level}</p>
          <p className="text-xs text-earth/60">Garden Level</p>
        </div>
        <div className="bg-white rounded-garden p-3 shadow-garden text-center">
          <p className="text-2xl font-bold text-terracotta">{garden.totalXp}</p>
          <p className="text-xs text-earth/60">Total XP</p>
        </div>
        <div className="bg-white rounded-garden p-3 shadow-garden text-center">
          <p className="text-2xl font-bold text-leaf">{garden.streak}</p>
          <p className="text-xs text-earth/60">Day Streak</p>
        </div>
      </div>

      {/* Resources */}
      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-1 text-sm">
          <span>\u2600\ufe0f</span>
          <span className="font-medium text-earth">{garden.sunlight}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span>\ud83d\udca7</span>
          <span className="font-medium text-earth">{garden.water}</span>
        </div>
      </div>

      {/* Garden Grid */}
      <div className="grid grid-cols-3 gap-3">
        {garden.plots.map((plot) => (
          <div
            key={plot.id}
            className={`aspect-square rounded-garden p-2 flex flex-col items-center justify-center ${
              plot.unlocked
                ? 'bg-white shadow-garden'
                : 'bg-earth/10 opacity-50'
            }`}
          >
            {plot.unlocked && plot.plant ? (
              <div className="text-center w-full">
                <PlantSprite plant={plot.plant} />
                <p className="text-xs text-earth/60 mt-1 truncate">{plot.plant.name}</p>
                <div className="flex gap-1 mt-1 justify-center">
                  <button
                    onClick={() => handleAction(plot.plant!.id, 'water')}
                    className="text-xs p-1 rounded bg-blue-50 hover:bg-blue-100"
                    title="Water"
                  >
                    \ud83d\udca7
                  </button>
                  <button
                    onClick={() => handleAction(plot.plant!.id, 'sunlight')}
                    className="text-xs p-1 rounded bg-yellow-50 hover:bg-yellow-100"
                    title="Sunlight"
                  >
                    \u2600\ufe0f
                  </button>
                </div>
              </div>
            ) : plot.unlocked ? (
              <div className="text-center">
                <p className="text-xs text-earth/40 mb-2">Empty Plot</p>
                <select
                  onChange={(e) => {
                    if (e.target.value) handlePlantSeed(plot.id, e.target.value as PlantType);
                  }}
                  className="text-xs p-1 rounded border border-earth/20"
                  defaultValue=""
                >
                  <option value="" disabled>Plant...</option>
                  {Object.entries(PLANT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.emoji} {config.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-earth/30">\ud83d\udd12</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
