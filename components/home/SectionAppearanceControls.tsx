import React from 'react';
import { SectionAppearance } from '../../types';

// Predefined gradient options - moved from GeneralSettings to here
const GRADIENT_PRESETS = [
  { name: 'Ocean Blue', colors: ['#667eea', '#764ba2'], direction: 'to right' },
  { name: 'Sunset', colors: ['#f093fb', '#f5576c'], direction: 'to right' },
  { name: 'Emerald', colors: ['#4facfe', '#00f2fe'], direction: 'to right' },
  { name: 'Purple Dream', colors: ['#6a11cb', '#2575fc'], direction: 'to right' },
  { name: 'Fiery Orange', colors: ['#fa709a', '#fee140'], direction: 'to right' },
  { name: 'Fresh Mint', colors: ['#43e97b', '#38f9d7'], direction: 'to right' },
  { name: 'Dark Night', colors: ['#1e3c72', '#2a5298'], direction: 'to right' },
  { name: 'Warm Flame', colors: ['#ff9a9e', '#fecfef'], direction: 'to right' }
];

interface SectionAppearanceControlsProps {
  section: SectionAppearance;
  onChange: (path: string, value: any) => void;
  onGradientPreset: (preset: any) => void;
}

const SectionAppearanceControls: React.FC<SectionAppearanceControlsProps> = ({
  section,
  onChange,
  onGradientPreset
}) => {
  return (
    <div className="space-y-4">
      {/* Background Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Background Type
        </label>
        <select 
          value={section.background.type}
          onChange={(e) => onChange('background.type', e.target.value)}
          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
        >
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>

      {/* Solid Color */}
      {section.background.type === 'solid' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input 
              type="color" 
              value={section.background.color}
              onChange={(e) => onChange('background.color', e.target.value)}
              className="w-12 h-12 rounded border border-slate-300 cursor-pointer"
            />
            <input 
              type="text" 
              value={section.background.color}
              onChange={(e) => onChange('background.color', e.target.value)}
              className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* Gradient Settings */}
      {section.background.type === 'gradient' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gradient Direction
            </label>
            <select 
              value={section.background.gradient?.direction || 'to right'}
              onChange={(e) => onChange('background.gradient.direction', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
            >
              <option value="to right">To Right</option>
              <option value="to left">To Left</option>
              <option value="to bottom">To Bottom</option>
              <option value="to top">To Top</option>
              <option value="to bottom right">To Bottom Right</option>
              <option value="to top right">To Top Right</option>
            </select>
          </div>

          {/* Gradient Colors */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gradient Colors
            </label>
            <div className="space-y-2">
              {(section.background.gradient?.colors || []).map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => {
                      const newColors = [...(section.background.gradient?.colors || [])];
                      newColors[index] = e.target.value;
                      onChange('background.gradient.colors', newColors);
                    }}
                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={color}
                    onChange={(e) => {
                      const newColors = [...(section.background.gradient?.colors || [])];
                      newColors[index] = e.target.value;
                      onChange('background.gradient.colors', newColors);
                    }}
                    className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm font-mono"
                  />
                  {(section.background.gradient?.colors?.length || 0) > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newColors = section.background.gradient?.colors?.filter((_, i) => i !== index) || [];
                        onChange('background.gradient.colors', newColors);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const currentColors = section.background.gradient?.colors || [];
                  onChange('background.gradient.colors', [...currentColors, '#000000']);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                + Add Color
              </button>
            </div>
          </div>

          {/* Gradient Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.slice(0, 4).map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onGradientPreset(preset)}
                  className="p-2 rounded border border-slate-200 hover:border-slate-400 transition-colors text-xs"
                  style={{
                    background: `linear-gradient(${preset.direction}, ${preset.colors.join(', ')})`
                  }}
                >
                  <span className="text-white font-medium text-shadow">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Text Color
        </label>
        <div className="flex items-center space-x-2">
          <input 
            type="color" 
            value={section.textColor}
            onChange={(e) => onChange('textColor', e.target.value)}
            className="w-12 h-12 rounded border border-slate-300 cursor-pointer"
          />
          <input 
            type="text" 
            value={section.textColor}
            onChange={(e) => onChange('textColor', e.target.value)}
            className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm font-mono"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Preview
        </label>
        <div 
          className="h-12 rounded border border-slate-300 flex items-center justify-center"
          style={{
            background: section.background.type === 'solid' 
              ? section.background.color
              : `linear-gradient(${section.background.gradient?.direction || 'to right'}, ${section.background.gradient?.colors?.join(', ') || '#000,#fff'})`,
            color: section.textColor
          }}
        >
          <span className="font-medium">Section Preview</span>
        </div>
      </div>
    </div>
  );
};

export default SectionAppearanceControls;