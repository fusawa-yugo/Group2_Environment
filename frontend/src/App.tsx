import React, { useState, useEffect, useRef } from 'react';
import Data from "../../json_data/template.json"

// --- Types and Data ---
type InputData = {
  hours: TimeStatus[];
}

type TimeStatus = {
  hour: number;
  rooms: Record<AreaName, RoomStatus>;
}

type AreaName = "room_a" | "room_b" | "room_c" | "room_d" | "room_e";

type RoomStatus = {
  noise: number;
  brightness: number;
  crowd: number;
  score_study: number;
  score_relaxing: number;
  score_eating: number;
  score_socializing: number;
}

const SelectOptions = ["noise", "brightness", "crowd", "score_study", "score_relaxing", "score_eating", "score_socializing"];

type LegendConfigType = Record<keyof RoomStatus, LegendProps>;
const LegendConfig: LegendConfigType = {
  noise: {
    color: "#4ade80", // Tailwind: fill-green-400
    textLower: "Quiet",
    textHigher: "Loud"
  },
  brightness: {
    color: "#facc15", // Tailwind: fill-yellow-400
    textLower: "Dim",
    textHigher: "Bright"
  },
  crowd: {
    color: "#93c5fd", // Tailwind: fill-blue-300
    textLower: "Empty",
    textHigher: "Crowded"
  },
  score_study: {
    color: "#fde047", // Tailwind: fill-yellow-300
    textLower: "Not Suitable",
    textHigher: "Good for Studying"
  },
  score_relaxing: {
    color: "#fcd34d", // Tailwind: fill-amber-300
    textLower: "Not Relaxing",
    textHigher: "Relaxing"
  },
  score_eating: {
    color: "#38bdf8", // Tailwind: fill-sky-400
    textLower: "Not Suitable",
    textHigher: "Good for Eating"
  },
  score_socializing: {
    color: "#fb923c", // Tailwind: fill-orange-400
    textLower: "Not Suitable",
    textHigher: "Good for Socializing"
  },
};

// --- Functions ---
const preparePlotData = (selectedTime: number, selectedParameterKey: keyof RoomStatus): Record<AreaName, number> => {
  const hourData = Data.hours.find(h => h.hour === selectedTime);
  if (!hourData) return {} as Record<AreaName, number>;

  return Object.entries(hourData.rooms).reduce((acc, [area, roomStatus]) => {
    acc[area as AreaName] = roomStatus[selectedParameterKey];
    return acc;
  }, {} as Record<AreaName, number>);
}

// --- Components ---

// TimeSlider Component
type TimeSliderProps = {
  time: number;
  setTime: (time: number) => void;
  startTime?: number;
  endTime?: number;
  step?: number;
}

const TimeSlider: React.FC<TimeSliderProps> = ({
  time,
  setTime,
  startTime = 10,
  endTime = 18,
  step = 2
}) => {
  const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  return (
    <div className="flex flex-col w-full p-2">
      <label htmlFor="time-range" className="text-gray-700 mb-2">Time: <span className="font-semibold">{formatTime(time)}</span></label>
      <input
        id="time-range"
        type="range"
        min={startTime}
        max={endTime}
        step={step}
        value={time}
        onChange={(e) => setTime(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb"
      />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>
    </div>
  );
};

// SenseSelector Component
type SenseSelectorProps = {
  options: string[];
  selectedValue: keyof RoomStatus;
  onValueChange: (value: keyof RoomStatus) => void;
  label?: string;
}

const SenseSelector: React.FC<SenseSelectorProps> = ({ options, selectedValue, onValueChange, label }) => {
  return (
    <div className="w-full flex flex-col p-2">
      {label && <label htmlFor="sense-select" className="text-gray-700 mb-2">{label}</label>}
      <select
        id="sense-select"
        className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out bg-white text-gray-800"
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value as keyof RoomStatus)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// Legend Component
type LegendProps = {
  color: string;
  textLower: string;
  textHigher: string;
}

const Legend: React.FC<LegendProps> = ({ color, textLower, textHigher }) => {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg bg-gray-50 flex-wrap justify-center">
      <div className="flex items-center space-x-2">
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></span>
        <span className="text-sm text-gray-700">{textLower}</span>
      </div>
      <div className="flex-grow h-2 bg-gradient-to-r from-white to-gray-300 via-transparent" />
      <div className="flex items-center space-x-2">
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></span>
        <span className="text-sm text-gray-700">{textHigher}</span>
      </div>
    </div>
  );
};

// MapComponent
interface MapComponentProps {
  plotData: Record<string, number>;
  selectedParameterKey: keyof RoomStatus;
}

const MapComponent: React.FC<MapComponentProps> = ({ plotData, selectedParameterKey }) => {
  const mapRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // HEX to RGB helper
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Interpolate white -> color based on ratio
  const interpolateColor = (value: number, min: number, max: number, colorHex: string) => {
    const ratio = (value - min) / (max - min || 1); // avoid division by zero
    const target = hexToRgb(colorHex);

    const r = Math.round(255 + (target.r - 255) * ratio);
    const g = Math.round(255 + (target.g - 255) * ratio);
    const b = Math.round(255 + (target.b - 255) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    if (!mapRef.current || !tooltipRef.current) return;

    const mapAreas = mapRef.current.querySelectorAll('.map-area');
    const tooltip = tooltipRef.current;

    // 塗りつぶし色セット
    const levels = Object.values(plotData);
    const min = Math.min(...levels);
    const max = Math.max(...levels);

    mapAreas.forEach(area => {
      const areaId = area.id;
      const level = plotData[areaId] || 0;
      area.setAttribute('data-name', areaId);
      area.setAttribute('data-level', level.toString());
      const fill = interpolateColor(level, min, max, LegendConfig[selectedParameterKey].color);
      area.setAttribute('fill', fill);
    });

    // tooltip イベントハンドラ
    const handleMouseEnter = (e: Event) => {
      const area = e.currentTarget as SVGElement;
      const name = area.getAttribute('data-name');
      const level = area.getAttribute('data-level');
      tooltip.innerHTML = `<strong>${name}</strong><br>${LegendConfig[selectedParameterKey].textHigher}: ${level}`;
      tooltip.style.display = 'block';
    };

    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent; // Cast the event to MouseEvent
      if (!mapRef.current || !tooltipRef.current) return;
    
      const mapRect = mapRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
    
      // ビューポート基準のマップ左上からの相対座標
      const offsetX = mouseEvent.clientX - mapRect.left;
      const offsetY = mouseEvent.clientY - mapRect.top;
    
      // ツールチップをマップの相対位置で表示（+10pxの余白）
      tooltip.style.left = `${offsetX + 10}px`;
      tooltip.style.top = `${offsetY + 10}px`;
    };

    const handleMouseLeave = () => {
      tooltip.style.display = 'none';
    };

    mapAreas.forEach(area => {
      area.addEventListener('mouseenter', handleMouseEnter);
      area.addEventListener('mousemove', handleMouseMove);
      area.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      mapAreas.forEach(area => {
        area.removeEventListener('mouseenter', handleMouseEnter);
        area.removeEventListener('mousemove', handleMouseMove);
        area.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [plotData, selectedParameterKey]);

  return (
    <div className="relative">
      <svg
        ref={mapRef}
        id="map"
        className="w-full h-auto"
        viewBox="0 0 700 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Area shapes */}
        <rect id="room_a" className="map-area" x="20" y="30" width="130" height="120" stroke="#000" strokeWidth="2" />
        <rect id="room_b" className="map-area" x="180" y="30" width="130" height="120" stroke="#000" strokeWidth="2" />
        <rect id="room_c" className="map-area" x="340" y="30" width="130" height="120" stroke="#000" strokeWidth="2" />
        <rect id="room_d" className="map-area" x="20" y="180" width="130" height="120" stroke="#000" strokeWidth="2" />
        <rect id="room_e" className="map-area" x="180" y="180" width="130" height="120" stroke="#000" strokeWidth="2" />
      </svg>
      <div
        ref={tooltipRef}
        className="absolute z-50 p-2 text-xs bg-white border border-gray-300 rounded shadow-lg pointer-events-none"
        style={{ display: 'none' }}
      />
    </div>
  );
};

// --- Main Component ---

const App: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState<number>(10);
  const [selectedParameterKey, setSelectedParameterKey] = useState<keyof RoomStatus>('noise');

  const plotData = preparePlotData(selectedTime, selectedParameterKey);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold text-center mb-6">Area Status Visualization</h1>

      <SenseSelector
        options={SelectOptions}
        selectedValue={selectedParameterKey}
        onValueChange={setSelectedParameterKey}
        label="Select Parameter"
      />

      <TimeSlider time={selectedTime} setTime={setSelectedTime} />

      <MapComponent plotData={plotData} selectedParameterKey={selectedParameterKey} />

      <Legend
        color={LegendConfig[selectedParameterKey].color}
        textLower={LegendConfig[selectedParameterKey].textLower}
        textHigher={LegendConfig[selectedParameterKey].textHigher}
      />
    </div>
  );
};

export default App;
