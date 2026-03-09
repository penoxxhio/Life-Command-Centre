import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PLANT_CONFIG } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface PlantPickerProps {
  onSelect: (type: string, name: string) => void;
  onCancel: () => void;
}

export const PlantPicker: React.FC<PlantPickerProps> = ({ onSelect, onCancel }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [name, setName] = useState('');

  const plantTypes = Object.entries(PLANT_CONFIG);

  const handlePlant = () => {
    if (!selectedType) return;
    onSelect(selectedType, name.trim() || PLANT_CONFIG[selectedType]?.name || 'My Plant');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-earth-600">Choose a seed to plant in your garden:</p>

      <div className="grid grid-cols-3 gap-3">
        {plantTypes.map(([key, config]) => (
          <motion.div
            key={key}
            whileTap={{ scale: 0.93 }}
            onClick={() => setSelectedType(key)}
          >
            <Card
              className={`p-3 text-center cursor-pointer transition-all ${
                selectedType === key
                  ? 'ring-2 ring-sage-500 bg-sage-50'
                  : 'hover:bg-cream-50'
              }`}
            >
              <div className="text-3xl mb-1">{config.emoji}</div>
              <p className="text-xs font-medium text-earth-700">{config.name}</p>
              <p className="text-[10px] text-earth-400">{config.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Input
            label="Name your plant (optional)"
            placeholder={PLANT_CONFIG[selectedType]?.name || 'My Plant'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          variant="warm"
          fullWidth
          onClick={handlePlant}
          disabled={!selectedType}
        >
          Plant Seed
        </Button>
      </div>
    </div>
  );
};
