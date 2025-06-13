// its not a best practice to have such a large file, but we will keep it all in one file for now so that all members can check and modify with genAI.

import React, { useState, useEffect, useRef } from 'react';

import RawData from "../../../json_data/output_mockup.json"

import { OrganizeData } from '../lib/OrganizeMapData';


import BackgroundMap from '../assets/darker_map.png';

const Data = OrganizeData(RawData);

// --- Types and Data ---

// type InputData = {
//   hours: TimeStatus[];
// }

// type TimeStatus = {
//   hour: number;
//   rooms: Record<AreaName, AreaStatus>;
// }

type AreaName = "UBICafe" | "PSOASLounge" | "WetteriSali" | "Tellus" | "CafeteriaLipasto" | "CafeteriaJulinia" | "LibraryPegasus";

const AreaConfig: AreaConfigType ={
	UBICafe: { name: "UBI Cafe" },
	PSOASLounge: { name: "PSOAS Lounge" },
	WetteriSali: { name: "Wetteri Sali" },
	Tellus: { name: "Tellus" },
	CafeteriaLipasto: { name: "Cafeteria Lipasto" },
	CafeteriaJulinia: { name: "Cafeteria Julinia" },
	LibraryPegasus: { name: "Library Pegasus" }
}

type AreaConfigType = {
	[key in AreaName]: {
		name: string
	}
}

type AreaStatus = {
  noise: number | null;
  brightness: number | null;
  crowd: number | null;
  score_study_alone: number | null;
  score_group_study: number | null;
  score_lecture: number | null;
  score_commuting_waiting: number | null;
  score_event: number | null;
};


type OptionConfigProps = {
  color: string;
  textLower: string;
  textHigher: string;
  minScore?: number;
  maxScore?: number;
  unit?: string;
	displayName?: string;
}



type OptionConfigType = Record<keyof AreaStatus, OptionConfigProps>;
const OptionConfig: OptionConfigType = {
  noise: {
    color: "#4ade80", // Tailwind: fill-green-400
    textLower: "Quiet",
    textHigher: "Loud",
    minScore: 0,
    maxScore: 1,
    // unit: "dB",
		displayName: "Noise"
  },
  brightness: {
    color: "#facc15", // Tailwind: fill-yellow-400
    textLower: "Dim",
    textHigher: "Bright", 
    minScore: 0,
    maxScore: 1,
    // unit: "lux",
		displayName: "Brightness"
  },
  crowd: {
    color: "#93c5fd", // Tailwind: fill-blue-300
    textLower: "Empty",
    textHigher: "Crowded",
    maxScore: 1,
    minScore: 0,
    displayName: "Crowd"
  },
  score_study_alone: {
    color: "#fde047", // Tailwind: fill-yellow-300
    textLower: "Not Suitable",
    textHigher: "Good",
    maxScore: 1,
    minScore: 0,
    displayName: "Score for Studying Alone"
		
  },
  score_group_study: {
    color: "#f87171", // Tailwind: fill-red-400
    textLower: "Not Suitable",
    textHigher: "Good",
    maxScore: 1,
    minScore: 0,
    displayName: "Score for Group Study"
		
  },
  score_lecture: {
    color: "#60a5fa", // Tailwind: fill-blue-400
    textLower: "Not Suitable",
    textHigher: "Good",
    maxScore: 1,
    minScore: 0,
		displayName: "Score for Having Lectures"
  },
  score_commuting_waiting: {
    color: "#34d399", // Tailwind: fill-green-400
    textLower: "Not Suitable",
    textHigher: "Good",
    maxScore: 1,
    minScore: 0,
		displayName: "Score for Commuting/Waiting"
  },
  score_event: {
    color: "#a78bfa", // Tailwind: fill-purple-400
    textLower: "Not Suitable",
    textHigher: "Good",
    maxScore: 1,
    minScore: 0,
		displayName: "Score for Events"
  },
};

// --- Functions ---
const preparePlotData = (selectedTime: number, selectedParameterKey: keyof AreaStatus): Record<AreaName, number> => {
  const hourData = Data.hours.find(h => h.hour === selectedTime);
  if (!hourData) return {} as Record<AreaName, number>;

  return Object.entries(hourData.rooms).reduce((acc, [area, areaStatus]) => {
		if (selectedParameterKey in areaStatus) {
			acc[area as AreaName] = areaStatus[selectedParameterKey] as number;
		}
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
  endTime = 16,
  step = 2
}) => {
  const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  return (
    <div className="flex flex-col w-full p-2">
      <label htmlFor="time-range" className="text-gray-700 mb-2">Time: <span className="font-semibold">{`${formatTime(time)} - ${formatTime(time + step)}`}</span></label>
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
  selectedValue: keyof AreaStatus;
  onValueChange: (value: keyof AreaStatus) => void;
  label?: string;
}

const SenseSelector: React.FC<SenseSelectorProps> = ({ selectedValue, onValueChange, label }) => {
  return (
    <div className="w-full flex flex-col p-2">
      {label && <label htmlFor="sense-select" className="text-gray-700 mb-2">{label}</label>}
      <select
        id="sense-select"
        className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out bg-white text-gray-800"
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value as keyof AreaStatus)}
      >
        {Object.keys(OptionConfig).map((option) => (
          <option key={option} value={option}>
            {OptionConfig[option as keyof AreaStatus].displayName || option}
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
    <div className="flex items-center space-x-4 p-1 rounded-lg bg-gray-50 flex-wrap justify-center gap-1 w-full">
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
  selectedParameterKey: keyof AreaStatus;
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

		const min = OptionConfig[selectedParameterKey].minScore || Math.min(...levels);
		const max = OptionConfig[selectedParameterKey].maxScore || Math.max(...levels);

		mapAreas.forEach(area => {
			const areaId = area.id;
			const level = plotData[areaId] || 0;

			area.setAttribute('data-level', level.toString());
			area.setAttribute('place-name', areaId);
			area.setAttribute('stroke', '#000');
			area.setAttribute('stroke-width', '10');
			const fill = interpolateColor(level, min, max, OptionConfig[selectedParameterKey].color);
			area.setAttribute('fill', fill);
		});

		// tooltip イベントハンドラ
		const handleMouseEnter = (e: Event) => {
			const area = e.currentTarget as SVGElement;
			const name = AreaConfig[area.id as AreaName]?.name || area.id;
			const level = area.getAttribute('data-level');
			tooltip.innerHTML = `<strong>${name}</strong><br>${OptionConfig[selectedParameterKey].textHigher}: ${level}`;
			tooltip.style.display = 'block';
		};

		const handleMouseMove = (e: Event) => {
			const mouseEvent = e as MouseEvent;
			if (!mapRef.current || !tooltipRef.current) return;

			const mapRect = mapRef.current.getBoundingClientRect();
			const tooltip = tooltipRef.current;

			const offsetX = mouseEvent.clientX - mapRect.left;
			const offsetY = mouseEvent.clientY - mapRect.top;

			tooltip.style.left = `${offsetX + 10}px`;
			tooltip.style.top = `${offsetY + 10}px`;
		};

		const handleMouseLeave = () => {
			tooltip.style.display = 'none';
		};

		const handleClick = (e: Event) => {
			const area = e.currentTarget as SVGElement;
			const areaId = area.id;
			window.location.href = `/statistics/${areaId}`;
		};

		mapAreas.forEach(area => {
			area.addEventListener('mouseenter', handleMouseEnter);
			area.addEventListener('mousemove', handleMouseMove);
			area.addEventListener('mouseleave', handleMouseLeave);
			area.addEventListener('click', handleClick);
		});

		return () => {
			mapAreas.forEach(area => {
				area.removeEventListener('mouseenter', handleMouseEnter);
				area.removeEventListener('mousemove', handleMouseMove);
				area.removeEventListener('mouseleave', handleMouseLeave);
				area.removeEventListener('click', handleClick);
			});
		};
	}, [plotData, selectedParameterKey]);

  return (
    <div className="relative border border-gray-300 border-2 overflow-hidden w-full max-w-[800px]">
			<img
				src={BackgroundMap}
				alt="Background Map"
				className="w-full h-auto"
			/>
			<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 				width="1207.000000pt" height="1760.000000pt" viewBox="0 0 1207.000000 1760.000000"
 				preserveAspectRatio="xMidYMid meet"
				ref={mapRef} className="absolute top-0 left-0 w-full h-auto"
			>
				<g transform="translate(0.000000,1760.000000) scale(0.100000,-0.100000)"
					fill="#000000" stroke="none">
				<path id="LibraryPegasus" className="map-area" d="M5740 15670 c-14 -4 -56 -9 -95 -9 -159 -3 -288 -67 -454 -226 -63
				-60 -130 -134 -149 -164 -49 -76 -154 -370 -159 -446 -4 -56 -2 -62 25 -88
				l29 -28 257 -14 c142 -7 259 -15 261 -17 8 -8 -25 -248 -36 -266 -28 -44 -7
				-48 257 -56 164 -4 252 -11 266 -19 18 -11 29 -2 121 96 107 112 129 124 177
				95 15 -10 23 -9 39 6 12 11 21 30 21 42 0 25 8 28 93 38 30 4 55 1 67 -7 17
				-10 24 -7 52 20 28 29 30 35 20 55 -9 16 -12 67 -10 165 2 116 0 145 -12 157
				-12 12 -63 18 -223 27 -114 6 -226 9 -248 7 l-39 -4 0 81 c-1 44 -5 165 -9
				270 -8 180 -8 190 10 203 23 16 24 35 3 53 -28 23 -219 45 -264 29z"/>
				<path id="CafeteriaJulinia" className="map-area" d="M5115 13290 c-3 -5 -6 -295 -5 -642 0 -527 3 -635 15 -647 17 -17 45
				-7 52 17 4 18 19 18 266 14 204 -3 265 -7 278 -18 20 -18 33 -18 47 -1 8 9 13
				196 17 593 3 318 8 591 11 605 3 16 -1 31 -10 38 -10 8 -110 19 -283 32 -306
				21 -379 23 -388 9z"/>
				<path id="CafeteriaLipasto" className="map-area" d="M5229 9134 c-17 -21 0 -48 32 -52 l24 -3 -3 -426 c-2 -412 -3 -427
				-22 -440 -27 -19 -25 -30 13 -69 37 -39 50 -42 70 -14 14 19 19 20 326 9 269
				-9 316 -8 335 4 22 15 22 20 39 483 18 496 17 501 -28 490 -12 -3 -177 3 -366
				14 -415 24 -403 24 -420 4z"/>
				<path id="Tellus" className="map-area" d="M3722 7363 c-19 -17 -21 -46 -42 -565 -25 -599 -25 -585 32 -573 16
				4 447 -1 959 -10 741 -14 932 -15 944 -5 10 9 13 23 9 49 -5 33 18 704 32 918
				5 83 8 92 26 95 31 5 46 34 27 53 -12 12 -57 16 -244 20 -127 3 -511 12 -855
				20 -827 20 -863 20 -888 -2z"/>
				<path id="UBICafe" className="map-area" d="M7890 4835 c-8 -9 -10 -34 -5 -77 3 -35 2 -155 -4 -268 -7 -155 -7
				-208 2 -219 10 -12 69 -13 387 -7 282 5 378 9 387 19 20 19 41 530 23 552 -18
				22 -771 23 -790 0z"/>
				<path id="WetteriSali" className="map-area" d="M3593 4263 c-12 -2 -26 -10 -31 -16 -5 -7 -15 -188 -21 -407 -6 -217
				-14 -412 -16 -432 -3 -23 0 -40 7 -45 7 -4 179 -6 383 -5 313 2 372 5 385 17
				11 12 12 20 4 33 -8 12 -9 131 -6 382 4 342 6 366 23 378 26 18 24 30 -13 68
				-37 38 -45 40 -69 18 -16 -14 -39 -14 -271 0 -247 16 -331 18 -375 9z"/>
				<path id="PSOASLounge" className="map-area" d="M6832 4148 c-8 -10 -52 -12 -189 -7 -98 4 -224 7 -280 8 -96 1 -103
				0 -117 -21 -10 -18 -16 -114 -25 -433 -6 -225 -13 -429 -15 -452 l-3 -43 312
				0 c268 0 314 2 325 15 18 21 54 913 38 932 -13 16 -33 17 -46 1z"/>
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
  const [selectedParameterKey, setSelectedParameterKey] = useState<keyof AreaStatus>('noise');

  const plotData = preparePlotData(selectedTime, selectedParameterKey);

  return (
    <div className="w-full mx-auto p-4 space-y-6 flex flex-col items-center max-w-[1200px]">
      <header className="flex flex-col items-center w-full  border-b border-gray-300 p-1 sticky top-0 left-0 bg-white z-100 m-0">
        <h1 className="text-xl font-bold text-center mb-4">Area Status Visualization</h1>

        <div className="flex justify-center items-center mb-2 gap-10 w-full">
          <div className="flex-1">
            <SenseSelector
              selectedValue={selectedParameterKey}
              onValueChange={setSelectedParameterKey}
              label="Select Parameter"
            />
          </div>
          <div className="flex flex-col flex-2  items-center">
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
