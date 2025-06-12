// its not a best practice to have such a large file, but we will keep it all in one file for now so that all members can check and modify with genAI.

import React, { useState, useEffect, useRef } from 'react';

import Data from "../../../json_data/template.json"


// --- Types and Data ---
type InputData = {
  hours: TimeStatus[];
}

type TimeStatus = {
  hour: number;
  rooms: Record<AreaName, RoomStatus>;
}

type AreaName = "room_a" | "room_b" | "room_c" | "room_d" | "room_e" | "room_f" | "room_g" | "room_h";

type RoomStatus = {
  noise: number;
  brightness: number;
  crowd: number;
  score_study: number;
  score_relaxing: number;
  score_eating: number;
  score_socializing: number;
}


type OptionConfigProps = {
  color: string;
  textLower: string;
  textHigher: string;
  minScore?: number;
  maxScore?: number;
  unit?: string;
}

const SelectOptions = ["noise", "brightness", "crowd", "score_study", "score_relaxing", "score_eating", "score_socializing"];

type OptionConfigType = Record<keyof RoomStatus, OptionConfigProps>;
const OptionConfig: OptionConfigType = {
  noise: {
    color: "#4ade80", // Tailwind: fill-green-400
    textLower: "Quiet",
    textHigher: "Loud",
    minScore: 40,
    maxScore: 70,
    unit: "dB"
  },
  brightness: {
    color: "#facc15", // Tailwind: fill-yellow-400
    textLower: "Dim",
    textHigher: "Bright", 
    minScore: 0,
    maxScore: 40000,
    unit: "lux",
    
  },
  crowd: {
    color: "#93c5fd", // Tailwind: fill-blue-300
    textLower: "Empty",
    textHigher: "Crowded",
    maxScore: 100,
    minScore: 0
  },
  score_study: {
    color: "#fde047", // Tailwind: fill-yellow-300
    textLower: "Not Suitable",
    textHigher: "Good for Studying",
    maxScore: 5,
    minScore: 1
  },
  score_relaxing: {
    color: "#fcd34d", // Tailwind: fill-amber-300
    textLower: "Not Relaxing",
    textHigher: "Relaxing",
    minScore: 1,
    maxScore: 5
  },
  score_eating: {
    color: "#38bdf8", // Tailwind: fill-sky-400
    textLower: "Not Suitable",
    textHigher: "Good for Eating",
    minScore: 1,
    maxScore: 5
  },
  score_socializing: {
    color: "#fb923c", // Tailwind: fill-orange-400
    textLower: "Not Suitable",
    textHigher: "Good for Socializing",
    minScore: 1,
    maxScore: 5
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
  minScore?: number;
  maxScore?: number;
  unit?: string;
}

// Legendコンポーネントを修正
const Legend: React.FC<LegendProps> = ({ 
  color, 
  textLower, 
  textHigher,
  minScore = undefined,
  maxScore = undefined,
  unit = undefined
}) => {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg bg-gray-50 flex-wrap justify-center gap-1 w-full">
        <p className="text-sm text-gray-700">{textLower}</p>
      { minScore !== undefined && (
        <p className='text-sm'>{minScore}{unit ? ` ${unit}` : ''}</p>
      )}
      <div 
        className="flex-grow h-4 w-auto border border-gray-300" 
        style={{ 
          background: `linear-gradient(to right, white, ${color})` 
        }} 
      />
      { maxScore !== undefined && (
        <p className='text-sm'>{maxScore}{unit ? ` ${unit}` : ''}</p>
      )}
        <p className="text-sm text-gray-700">{textHigher}</p>
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

    const levels = Object.values(plotData);

    //ここ注意
    const min = OptionConfig[selectedParameterKey].minScore || Math.min(...levels);
    const max = OptionConfig[selectedParameterKey].maxScore || Math.max(...levels);

    mapAreas.forEach(area => {
      const areaId = area.id;
      const level = plotData[areaId] || 0;
      area.setAttribute('data-name', areaId);
      area.setAttribute('data-level', level.toString());
      area.setAttribute('stroke', '#000');
      area.setAttribute('stroke-width', '10');
      const fill = interpolateColor(level, min, max, OptionConfig[selectedParameterKey].color);
      area.setAttribute('fill', fill);
    });

    // tooltip イベントハンドラ
    const handleMouseEnter = (e: Event) => {
      const area = e.currentTarget as SVGElement;
      const name = area.getAttribute('data-name');
      const level = area.getAttribute('data-level');
      tooltip.innerHTML = `<strong>${name}</strong><br>${OptionConfig[selectedParameterKey].textHigher}: ${level}`;
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
    <div className="relative border border-gray-300 border-2 overflow-hidden">
      <svg id="map" version="1.0" xmlns="http://www.w3.org/2000/svg"
      width="1207.000000pt" height="1760.000000pt" viewBox="0 0 1207.000000 1760.000000"
      preserveAspectRatio="xMidYMid meet"
      ref={mapRef} className="w-full h-auto">

      <g transform="translate(0.000000,1760.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="none">
      <path id="room_a" className="map-area" d="M9960 16575 c-11 -13 -11 -20 0 -39 8 -16 10 -42 6 -77 -14 -112 -12
      -108 -68 -111 -60 -4 -82 -25 -56 -55 14 -16 13 -56 -18 -468 -18 -247 -33
      -453 -34 -456 0 -3 -10 -5 -22 -5 -20 1 -66 -48 -244 -258 -23 -26 -32 -29
      -109 -34 -73 -4 -85 -3 -85 11 0 25 81 722 85 725 1 2 61 8 131 13 71 6 138
      15 149 19 11 5 28 11 38 14 9 3 19 11 22 18 2 7 13 135 23 283 13 183 23 278
      33 293 31 49 23 50 -489 62 -331 8 -479 14 -493 23 -38 24 -47 -5 -59 -181
      -12 -169 -9 -192 28 -192 12 0 14 -15 8 -97 -3 -54 -13 -282 -22 -508 -9 -225
      -18 -412 -20 -413 -4 -6 -368 -30 -374 -25 -2 2 -6 269 -8 593 -5 636 -4 628
      -55 602 -16 -8 -58 -9 -147 -3 -101 7 -129 6 -147 -5 -25 -16 -29 -34 -12 -51
      8 -8 9 -170 4 -585 l-8 -574 -270 -18 c-148 -9 -271 -15 -274 -13 -4 5 14 518
      23 655 l6 82 213 0 c185 0 214 2 226 17 11 12 15 69 17 246 3 205 1 231 -14
      248 -16 18 -39 19 -464 19 -321 0 -449 3 -457 11 -9 9 -21 8 -48 -5 -47 -22
      -55 -44 -26 -67 l23 -19 -16 -532 c-10 -293 -19 -552 -22 -575 l-5 -43 -97 0
      c-53 0 -121 3 -149 6 l-53 7 0 564 c0 428 3 568 12 583 10 16 10 22 -2 34 -13
      13 -60 13 -350 4 -253 -8 -341 -14 -357 -25 -27 -16 -29 -30 -8 -53 14 -15 15
      -54 9 -304 l-7 -286 -73 0 -73 0 -168 -137 c-92 -75 -226 -184 -298 -243 -71
      -59 -171 -141 -221 -181 -188 -153 -419 -350 -423 -361 -2 -7 6 -9 26 -5 17 3
      35 1 40 -4 6 -6 23 -9 39 -7 19 2 34 -3 44 -15 15 -18 25 -18 260 -3 135 9
      273 18 308 22 l63 6 -6 -104 c-3 -56 -8 -113 -10 -124 -5 -21 -10 -21 -290
      -29 -255 -6 -288 -5 -304 9 -24 21 -26 21 -72 -16 -44 -36 -48 -50 -18 -72 21
      -14 22 -19 14 -172 l-7 -156 44 5 c38 4 608 -28 613 -35 5 -6 -10 -227 -16
      -233 -4 -3 -357 -10 -785 -15 -429 -6 -850 -16 -937 -22 -171 -12 -188 -19
      -150 -61 11 -12 23 -37 26 -55 l7 -32 -83 7 c-128 12 -179 10 -187 -7 -4 -8
      -12 -25 -18 -37 -15 -29 -17 -419 -2 -428 6 -4 1 -14 -12 -25 -19 -15 -21 -22
      -12 -37 11 -17 26 -18 194 -14 118 2 180 0 177 -6 -8 -12 -31 -465 -28 -543 2
      -63 21 -91 49 -74 9 6 18 23 20 38 4 30 0 30 148 15 66 -6 115 -16 125 -25 20
      -18 26 -18 60 7 32 22 37 50 14 69 -13 10 -15 51 -15 249 l0 236 243 -3 242
      -3 -16 -256 c-9 -140 -14 -267 -11 -280 6 -30 27 -40 47 -23 8 7 99 22 201 34
      148 17 189 25 197 38 14 21 -7 48 -36 48 -20 0 -20 4 -14 158 4 86 7 190 7
      230 l0 73 117 -7 c65 -3 119 -7 119 -8 5 -4 25 -768 21 -772 -8 -9 -230 16
      -242 26 -17 14 -96 -3 -109 -23 -9 -15 -6 -22 17 -41 l29 -23 -21 -169 c-30
      -238 -31 -244 -47 -244 -17 0 -17 0 -3 -56 6 -24 16 -44 23 -44 6 0 21 -3 33
      -6 17 -5 23 -2 23 10 0 20 -9 21 278 -6 197 -18 245 -20 251 -9 5 7 14 60 21
      117 15 119 3 111 134 88 88 -15 92 -15 240 12 163 29 189 41 168 75 -8 12 -12
      22 -10 23 2 2 314 11 694 21 l691 18 7 233 c7 226 1 903 -10 1132 -4 101 -3
      112 12 112 10 0 25 -6 33 -13 10 -9 104 -23 256 -40 l239 -26 34 34 33 33 34
      328 c19 181 37 348 40 372 l6 42 668 0 c367 0 878 3 1135 7 l467 6 21 30 c21
      29 21 31 9 326 -6 163 -14 316 -17 341 l-5 46 95 -3 c74 -1 96 1 96 11 0 8 7
      19 15 26 13 11 15 72 15 439 0 234 3 483 7 553 5 111 8 127 24 131 11 3 22 13
      26 23 11 30 -29 51 -114 58 -127 12 -117 -4 -108 165 6 135 5 148 -12 162 -12
      11 -65 22 -158 33 -167 19 -150 19 -165 1z"/>
      <path id="room_b" className="map-area" d="M8117 12494 c-11 -11 -8 -49 4 -61 8 -8 13 -165 17 -530 3 -321 8
      -523 14 -530 8 -10 5 -13 -8 -14 -293 -12 -942 -23 -951 -16 -21 15 -57 3 -72
      -25 -13 -22 -13 -33 -3 -61 17 -46 16 -257 0 -257 -7 0 -101 -9 -208 -20 -107
      -10 -195 -18 -197 -17 -1 2 3 75 9 162 7 107 15 165 24 176 18 20 18 53 0 68
      -10 8 -119 16 -333 23 -375 14 -442 13 -479 -7 -16 -8 -52 -20 -81 -26 l-51
      -12 -6 -111 c-3 -61 -8 -320 -11 -576 -3 -256 -8 -584 -12 -730 l-6 -266 27
      -17 c23 -16 37 -16 141 -6 64 7 118 10 121 7 2 -3 7 -52 11 -109 3 -57 10
      -110 16 -117 5 -7 26 -12 46 -11 32 1 411 -47 417 -54 1 -1 17 -218 34 -482
      24 -354 36 -484 46 -494 12 -13 35 -13 172 -2 88 7 179 10 204 6 31 -5 47 -3
      55 7 12 14 22 106 12 110 -3 2 -9 83 -12 181 l-6 178 42 -5 c23 -3 87 -8 142
      -11 55 -3 127 -8 160 -11 l60 -6 -3 -53 c-4 -51 -3 -53 25 -59 15 -4 93 -8
      173 -11 80 -2 375 -12 657 -21 548 -18 543 -18 543 30 0 17 6 22 26 21 48 0
      50 16 29 252 l-20 218 225 -12 c302 -16 403 -16 418 -1 7 7 12 24 12 38 0 17
      8 29 23 35 22 10 22 14 27 215 7 242 6 244 -74 236 -28 -3 -133 -8 -233 -11
      l-182 -7 -6 144 c-3 79 -5 196 -5 262 l1 118 -33 -5 c-31 -6 -900 29 -963 39
      l-30 4 3 78 c2 42 5 78 7 80 1 1 151 -5 333 -14 356 -18 362 -18 362 31 0 12
      -7 29 -17 36 -17 15 -17 212 3 1579 l7 435 -224 2 c-123 2 -267 5 -319 8 -53
      4 -99 3 -103 -1z"/>
      <path id="room_c" className="map-area" d="M3197 11840 l-15 -22 -462 18 c-420 16 -462 16 -477 1 -19 -19 -10
      -47 17 -54 18 -5 20 -11 15 -52 -11 -101 -47 -676 -43 -701 4 -26 2 -28 -59
      -39 -34 -6 -76 -14 -93 -17 l-30 -6 0 193 c0 185 1 194 22 216 18 19 20 28 12
      41 -10 16 -52 17 -510 19 -344 1 -502 -1 -511 -9 -19 -16 -19 -681 0 -696 8
      -7 29 -9 50 -5 28 4 42 1 57 -12 18 -16 51 -17 529 -10 l510 8 5 -24 c3 -13 7
      -87 10 -165 l5 -141 -127 -17 c-70 -10 -134 -21 -142 -25 -12 -6 -17 -42 -24
      -167 -5 -87 -10 -160 -11 -162 -2 -2 -121 4 -265 13 -239 15 -265 15 -279 0
      -13 -12 -13 -19 -3 -35 17 -28 15 -49 -7 -68 -19 -16 -20 -44 -31 -556 -9
      -468 -9 -542 4 -554 18 -18 46 -9 53 17 4 17 19 20 159 26 136 7 156 10 168
      27 13 18 37 19 492 28 264 5 576 9 695 10 208 0 217 -1 222 -20 11 -44 67 -31
      67 16 0 12 4 25 8 28 5 3 9 107 11 233 1 125 5 231 8 237 4 6 132 7 338 2 287
      -6 334 -5 344 8 9 10 22 13 42 9 18 -3 38 0 54 11 22 14 25 24 25 74 l0 58
      253 34 252 33 565 -2 c311 -1 570 2 576 6 7 6 14 251 22 788 10 706 9 885 -5
      885 -28 0 -146 -47 -157 -62 -9 -12 -16 -16 -21 -9 -8 14 -95 13 -222 -3 -94
      -11 -103 -11 -103 4 0 25 -21 40 -56 40 -39 0 -50 -13 -70 -79 -12 -41 -13
      -63 -4 -108 15 -86 13 -114 -9 -120 -11 -3 -22 -15 -24 -27 -4 -21 -4 -21 -6
      2 -1 27 -31 30 -31 3 0 -11 -4 -22 -9 -25 -5 -3 -213 1 -462 10 -250 8 -461
      13 -470 11 -15 -4 -17 21 -24 246 -6 209 -10 255 -24 281 l-18 31 -339 6
      c-186 3 -351 7 -366 8 l-28 1 0 101 c0 74 4 108 16 128 15 25 15 29 -3 61 -24
      42 -46 49 -66 20z"/>
      <path id="room_d" className="map-area" d="M4950 9550 l-295 -5 -245 -327 c-142 -190 -252 -327 -261 -328 -35
      -1 -40 -25 -41 -199 -1 -176 5 -204 41 -200 77 7 63 21 317 -316 130 -173 241
      -315 245 -315 4 0 5 -32 2 -71 l-6 -71 470 7 c259 4 508 10 553 14 l83 6 208
      333 c115 183 209 339 209 346 0 34 -39 62 -106 75 l-67 14 5 299 c4 204 9 303
      17 311 6 6 11 17 11 24 0 7 -97 94 -215 193 -144 122 -215 188 -215 201 0 21
      -19 21 -710 9z"/>
      <path id="room_e" className="map-area" d="M1868 8583 c-23 -27 -527 -770 -534 -788 -4 -8 -2 -21 4 -28 5 -6 12
      -86 15 -177 6 -164 6 -166 -16 -175 -40 -18 -27 -47 43 -93 35 -23 68 -50 71
      -60 4 -10 25 -26 48 -37 37 -16 41 -22 42 -54 0 -20 4 -157 8 -306 7 -223 6
      -273 -5 -286 -18 -20 -18 -34 1 -49 9 -7 15 -35 17 -72 2 -44 8 -64 20 -71 30
      -19 48 8 48 73 l0 58 93 6 c50 3 170 9 265 12 150 6 174 9 185 25 7 9 25 21
      39 24 23 6 27 4 30 -21 4 -35 30 -53 52 -35 21 17 20 65 -3 211 -10 63 -18
      116 -17 116 0 1 84 -9 186 -22 102 -12 201 -23 221 -24 l37 0 6 -142 c3 -79 7
      -189 9 -246 l2 -102 -716 0 c-642 0 -718 -2 -730 -16 -18 -22 0 -48 37 -52
      l29 -3 -3 -676 c-2 -605 -4 -679 -18 -694 -17 -19 -16 -24 14 -74 22 -35 53
      -39 66 -8 9 20 19 21 160 27 83 3 269 8 414 12 256 6 262 5 262 -14 0 -41 53
      -55 65 -17 9 27 15 40 27 57 10 14 9 21 -6 37 -17 19 -18 32 -13 132 4 62 8
      113 9 115 2 1 94 8 205 15 186 11 204 11 221 -4 26 -23 32 -22 70 17 36 37 38
      43 18 65 -12 14 -12 33 -2 123 7 59 14 110 17 112 3 3 265 16 583 29 360 15
      581 28 588 35 7 7 10 101 9 278 l-2 267 48 -6 c26 -3 96 -9 155 -13 58 -4 112
      -10 118 -14 10 -6 10 -49 2 -196 -10 -175 -10 -190 6 -204 10 -8 16 -22 14
      -31 -5 -28 26 -41 175 -70 177 -34 189 -35 205 -10 9 15 19 18 40 14 47 -9 55
      7 62 125 10 152 15 175 33 161 10 -9 113 -16 334 -22 l319 -10 0 -39 0 -39 48
      3 c45 3 47 4 50 36 2 24 -1 32 -12 32 -20 0 -21 47 -2 69 12 13 16 146 26 783
      8 556 8 773 0 788 -8 14 -8 47 -1 108 5 48 8 89 6 91 -2 2 -266 -2 -586 -9
      l-583 -12 -19 23 -18 23 -425 -26 c-301 -18 -428 -29 -440 -39 -10 -8 -13 -22
      -10 -38 3 -14 3 -20 0 -13 -9 20 -21 14 -28 -15 -12 -57 -18 -59 -194 -66
      l-164 -7 6 68 c3 37 8 231 11 432 3 201 8 414 11 474 3 73 1 113 -7 122 -9 12
      -120 14 -644 14 -550 0 -634 2 -645 15 -17 20 -43 19 -62 -2z"/>
      <path id="room_f" className="map-area" d="M7834 8123 c-1089 -3 -1213 -5 -1225 -19 -9 -11 -10 -20 -2 -32 6
      -11 8 -90 5 -225 -5 -206 -5 -209 -26 -203 -11 3 -191 -3 -399 -14 -342 -18
      -380 -19 -401 -5 -24 16 -24 15 -31 -27 -10 -62 -17 -1621 -8 -1753 l8 -110
      314 -3 c184 -1 317 -6 321 -12 3 -5 257 -16 604 -25 770 -19 850 -19 866 0 10
      12 16 211 27 838 8 452 16 823 17 824 2 2 342 8 757 14 427 5 764 14 777 20
      13 5 47 6 77 3 l54 -7 3 359 c2 198 -1 365 -6 372 -6 9 -69 11 -265 10 -141
      -2 -801 -4 -1467 -5z"/>
      <path id="room_g" className="map-area" d="M5550 5366 l0 -274 -62 -6 c-35 -3 -124 -8 -198 -12 -74 -4 -140 -11
      -147 -16 -13 -10 -12 -11 -33 82 -14 66 -13 78 11 82 54 8 44 68 -11 68 -15 0
      -33 7 -40 15 -16 19 -29 19 -49 1 -13 -12 -142 -16 -780 -23 -701 -7 -765 -9
      -775 -25 -8 -13 -6 -21 7 -36 15 -17 17 -51 17 -345 l0 -327 -55 0 c-30 0 -55
      -4 -55 -10 0 -5 -24 -10 -52 -11 -97 -1 -142 -12 -153 -36 -8 -20 -15 -22 -65
      -17 -30 3 -257 18 -505 34 -247 16 -463 34 -480 40 -34 11 -575 70 -646 70
      -41 0 -50 -4 -73 -34 -27 -36 -33 -65 -17 -82 5 -5 11 -88 13 -185 3 -187 9
      -209 52 -209 27 0 46 18 46 42 0 23 -8 23 266 -7 126 -14 233 -25 240 -25 7 0
      13 -38 18 -110 20 -357 21 -324 -5 -335 -20 -8 -25 -19 -27 -59 l-3 -48 183 6
      c101 3 597 11 1103 17 506 6 924 15 928 19 4 4 11 140 15 302 8 312 11 328 56
      328 18 1 17 4 -13 29 l-34 28 -245 5 c-226 5 -246 7 -259 24 -12 16 -13 78 -1
      89 2 2 554 16 1228 32 1197 29 1225 29 1240 11 14 -17 20 -18 69 -7 47 10 58
      9 84 -6 22 -13 41 -16 77 -11 29 4 51 2 55 -4 3 -5 22 -10 41 -10 35 0 38 4
      58 68 6 18 4 22 -14 22 l-21 0 2 464 c0 255 -1 469 -5 474 -3 5 -81 13 -172
      17 l-166 7 5 34 c3 20 17 44 33 57 32 28 28 52 -11 67 -33 13 -82 13 -87 1 -2
      -7 -427 -41 -509 -41 -5 0 -9 11 -9 25 0 22 -4 25 -35 25 l-35 0 0 -274z"/>
      <path id="room_h" className="map-area" d="M7707 5094 c-4 -4 -7 -29 -7 -56 0 -42 2 -48 22 -48 21 0 21 -1 15
      -159 -7 -186 -7 -186 78 -179 51 4 54 3 50 -16 -2 -12 -7 -48 -10 -80 l-7 -59
      -592 7 -593 6 -11 -39 c-16 -51 -15 -71 3 -71 11 0 15 -11 15 -40 0 -46 -4
      -47 -105 -29 -86 14 -1414 12 -1433 -3 -21 -18 -11 -81 16 -93 22 -10 22 -12
      22 -200 0 -135 4 -195 12 -203 15 -15 75 -16 84 0 7 11 306 9 1060 -9 l280 -6
      12 -346 c7 -190 12 -388 12 -438 l0 -93 -180 0 c-151 0 -182 -2 -186 -15 -4
      -8 -18 -15 -33 -15 -46 0 -51 -14 -51 -152 l0 -128 -33 0 c-45 0 -57 -15 -57
      -75 0 -28 5 -56 12 -63 9 -9 96 -12 330 -12 l318 0 0 -65 0 -65 -93 0 c-59 0
      -97 -4 -105 -12 -7 -7 -12 -30 -12 -51 l0 -39 -92 6 c-51 3 -198 8 -327 12
      -139 4 -242 11 -252 17 -13 8 -22 7 -33 -2 -14 -12 -16 -48 -17 -265 0 -138
      -4 -318 -8 -401 -6 -111 -5 -153 4 -163 19 -21 799 38 823 62 13 13 14 20 5
      35 -19 30 3 135 31 147 16 7 22 20 24 52 l3 42 48 0 48 0 8 -322 c5 -178 9
      -439 10 -580 0 -170 5 -262 12 -269 13 -13 441 8 461 24 8 6 12 37 12 88 0 82
      12 101 38 59 9 -15 23 -20 58 -20 40 0 70 14 250 119 116 68 238 132 284 148
      44 15 80 33 80 39 0 6 32 30 70 52 48 28 70 36 70 26 0 -20 79 -19 108 2 20
      14 22 23 22 108 0 99 -5 111 -49 118 -19 2 -65 61 -213 273 l-189 270 43 7
      c24 3 72 7 108 7 37 1 71 6 78 13 7 7 12 43 12 92 0 52 5 91 15 110 18 34 20
      137 3 154 -9 9 -107 12 -381 12 l-370 0 7 663 c3 364 9 803 12 975 l7 314 136
      -6 c75 -4 162 -9 194 -12 l57 -6 1 -36 c0 -21 10 -204 23 -409 16 -265 26
      -376 35 -387 15 -18 76 -22 87 -4 5 8 82 9 298 4 159 -4 291 -8 291 -9 1 -1
      -3 -50 -8 -109 -9 -100 -11 -108 -31 -108 -11 0 -164 12 -338 26 -250 21 -321
      24 -332 14 -8 -6 -18 -32 -22 -57 -7 -46 12 -191 27 -207 5 -6 9 -36 9 -68 l0
      -58 -38 0 c-46 0 -62 -14 -62 -55 0 -41 16 -55 62 -55 35 0 38 -2 38 -28 0
      -36 17 -52 55 -52 39 0 55 16 55 55 l0 31 923 18 c507 10 992 21 1079 25 142
      5 157 4 167 -11 13 -21 71 -24 89 -6 7 7 12 32 12 58 1 95 -73 976 -83 988 -7
      9 -76 12 -284 12 l-274 0 -34 -25 -33 -26 -7 -199 -7 -200 -102 1 c-146 0
      -496 15 -501 21 -5 5 25 490 30 496 8 9 1269 -18 1279 -28 18 -18 71 -11 94
      13 17 18 21 34 20 82 0 33 7 144 17 247 15 152 16 190 5 203 -14 17 -62 20
      -88 4 -12 -7 -205 4 -715 44 -383 30 -699 56 -701 58 -2 2 -7 32 -11 67 l-7
      62 114 0 c62 0 244 5 403 10 160 5 331 10 380 10 50 1 122 8 161 16 l71 15 6
      92 c4 51 9 106 12 122 3 17 2 35 -3 42 -4 7 -47 16 -102 20 -83 7 -96 11 -104
      29 -11 25 5 24 -546 55 -206 11 -384 24 -395 29 -25 11 -1047 24 -1058 14z"/>
      </g>
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

const MapPage: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState<number>(10);
  const [selectedParameterKey, setSelectedParameterKey] = useState<keyof RoomStatus>('noise');

  const plotData = preparePlotData(selectedTime, selectedParameterKey);

  return (
    <div className="max-w-[1200px] mx-auto p-4 space-y-6">
      <header className="w-full border-b border-gray-300 p-2 sticky top-0 left-0 bg-white z-100">
        <h1 className="text-xl font-bold text-center mb-4">Area Status Visualization</h1>

        <div className="flex justify-center items-center mb-2 gap-3">
          <div className="flex-1">
            <SenseSelector
              options={SelectOptions}
              selectedValue={selectedParameterKey}
              onValueChange={setSelectedParameterKey}
              label="Select Parameter"
            />
          </div>
          <div className="flex flex-col flex-2 items-center">
            <TimeSlider time={selectedTime} setTime={setSelectedTime} />
            <Legend
              color={OptionConfig[selectedParameterKey].color}
              textLower={OptionConfig[selectedParameterKey].textLower}
              textHigher={OptionConfig[selectedParameterKey].textHigher}
              minScore={OptionConfig[selectedParameterKey].minScore}
              maxScore={OptionConfig[selectedParameterKey].maxScore}
              unit={OptionConfig[selectedParameterKey].unit}
            />
          </div>
        </div>
      </header>


      <MapComponent plotData={plotData} selectedParameterKey={selectedParameterKey} />
    </div>
  );
};

export default MapPage;
