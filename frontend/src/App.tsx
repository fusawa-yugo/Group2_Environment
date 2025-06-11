import React, { useState, useEffect, useRef } from 'react';

// Note: Writing all components in this file
// This is not a recommended practice but is easy for team members
// to understand and modify with genAI.

// --- Types and Data ---
type SenseOptionKey = "noise" | "brightness" | "smell" | "occupancy";
type SenseOptionDisplay = {
  label: string;
  value: SenseOptionKey;
};

const senseOptions: SenseOptionDisplay[] = [
  { label: "Noise Level", value: "noise" },
  { label: "Brightness", value: "brightness" },
  { label: "Smell", value: "smell" },
  { label: "Occupancy", value: "occupancy" },
];

// --- MOCK DATA ---
const mockData: {
  timeBasedData: Record<number, Record<SenseOptionKey, Record<string, string>>>;
  noise: Record<string, string>;
  brightness: Record<string, string>;
  smell: Record<string, string>;
  occupancy: Record<string, string>;
} = {
  timeBasedData: {
    8: {
      noise: { 'pegasus-library': 'low', 'tellus-arena': 'low', 'main-lobby': 'medium', 'restaurant-kastari': 'medium', 'itee-faculty': 'low', 'lecture-halls': 'low', },
      brightness: { 'pegasus-library': 'high', 'tellus-arena': 'high', 'main-lobby': 'medium', 'restaurant-kastari': 'medium', 'itee-faculty': 'medium', 'lecture-halls': 'medium', },
      smell: { 'pegasus-library': 'low', 'tellus-arena': 'low', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'low', 'lecture-halls': 'low', },
      occupancy: { 'pegasus-library': 'low', 'tellus-arena': 'low', 'main-lobby': 'medium', 'restaurant-kastari': 'medium', 'itee-faculty': 'low', 'lecture-halls': 'low', }
    },
    12: {
      noise: { 'pegasus-library': 'medium', 'tellus-arena': 'high', 'main-lobby': 'high', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'medium', },
      brightness: { 'pegasus-library': 'high', 'tellus-arena': 'high', 'main-lobby': 'high', 'restaurant-kastari': 'high', 'itee-faculty': 'high', 'lecture-halls': 'high', },
      smell: { 'pegasus-library': 'medium', 'tellus-arena': 'medium', 'main-lobby': 'high', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'medium', },
      occupancy: { 'pegasus-library': 'medium', 'tellus-arena': 'high', 'main-lobby': 'high', 'restaurant-kastari': 'high', 'itee-faculty': 'high', 'lecture-halls': 'medium', }
    },
    16: {
      noise: { 'pegasus-library': 'medium', 'tellus-arena': 'medium', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
      brightness: { 'pegasus-library': 'high', 'tellus-arena': 'high', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'medium', },
      smell: { 'pegasus-library': 'medium', 'tellus-arena': 'medium', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
      occupancy: { 'pegasus-library': 'medium', 'tellus-arena': 'medium', 'main-lobby': 'high', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'low', }
    },
    20: {
      noise: { 'pegasus-library': 'high', 'tellus-arena': 'low', 'main-lobby': 'low', 'restaurant-kastari': 'low', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
      brightness: { 'pegasus-library': 'medium', 'tellus-arena': 'low', 'main-lobby': 'low', 'restaurant-kastari': 'low', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
      smell: { 'pegasus-library': 'high', 'tellus-arena': 'low', 'main-lobby': 'low', 'restaurant-kastari': 'low', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
      occupancy: { 'pegasus-library': 'high', 'tellus-arena': 'low', 'main-lobby': 'low', 'restaurant-kastari': 'low', 'itee-faculty': 'medium', 'lecture-halls': 'low', }
    },
  },

  noise: { 'pegasus-library': 'low', 'tellus-arena': 'medium', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
  brightness: { 'pegasus-library': 'high', 'tellus-arena': 'high', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'medium', },
  smell: { 'pegasus-library': 'low', 'tellus-arena': 'medium', 'main-lobby': 'medium', 'restaurant-kastari': 'high', 'itee-faculty': 'medium', 'lecture-halls': 'low', },
  occupancy: { 'pegasus-library': 'medium', 'tellus-arena': 'medium', 'main-lobby': 'high', 'restaurant-kastari': 'high', 'itee-faculty': 'high', 'lecture-halls': 'low', }
};

const config = {
  noise: {
    low: { color: 'fill-green-400', text: 'Quiet' },
    medium: { color: 'fill-yellow-400', text: 'Moderate' },
    high:  { color: 'fill-red-500', text: 'Noisy' }
  },
  brightness: {
    low: { color: 'fill-blue-300', text: 'Low' },
    medium: { color: 'fill-yellow-300', text: 'Medium' },
    high:  { color: 'fill-amber-300', text: 'High' }
  },
  smell: {
    low: { color: 'fill-green-400', text: 'Fresh' },
    medium: { color: 'fill-yellow-400', text: 'Noticeable' },
    high:  { color: 'fill-red-500', text: 'Strong' }
  },
  occupancy: {
    low: { color: 'fill-sky-400', text: 'Not Crowded' },
    medium: { color: 'fill-orange-400', text: 'Moderate' },
    high:  { color: 'fill-fuchsia-600', text: 'Very Crowded' }
  }
};

// --- Helper Functions ---
function getNearestTimeKey(hour: number): number {
    const availableHours = Object.keys(mockData.timeBasedData).map(Number);
    return availableHours.reduce((prev, curr) =>
        Math.abs(curr - hour) < Math.abs(prev - hour) ? curr : prev
    );
}

// --- Components ---

// TimeSlider Component Props
type TimeSliderProps = {
  time: number;
  setTime: (time: number) => void;
  startTime?: number;
  endTime?: number;
  step?: number;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ time, setTime, startTime = 8, endTime = 22, step = 1 }) => {
    // Helper to format time for display
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

// SenseSelector Component Props
type SenseSelectorProps = {
  options: SenseOptionDisplay[];
  selectedValue: SenseOptionKey;
  onValueChange: (value: SenseOptionKey) => void;
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
        onChange={(e) => onValueChange(e.target.value as SenseOptionKey)} // Cast to SenseOptionKey
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Legend Component Props
type LegendProps = {
    parameter: SenseOptionKey;
    config: typeof config; // Using typeof config to infer its type
}

const Legend: React.FC<LegendProps> = ({ parameter, config }) => {
    const colorConfig = config[parameter];

  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg bg-gray-50 flex-wrap justify-center">
        {Object.keys(colorConfig).map((levelKey) => {
          const item = colorConfig[levelKey as keyof typeof colorConfig]; // Type assertion for levelKey
          return (
              <div key={levelKey} className="flex items-center space-x-2 my-1">
                  <span className={`w-4 h-4 rounded-full ${item.color}`}></span>
                  <span className="text-sm text-gray-600">{item.text}</span>
              </div>
          );
        })}
    </div>
  );
};


// Map Component Props
type MapComponentProps = {
    selectedParameterKey: SenseOptionKey;
    selectedTime: number;
    mockData: typeof mockData;
    config: typeof config;
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedParameterKey, selectedTime, mockData, config }) => {
    const mapRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

        const dataSet = mockData.timeBasedData[nearestHour][selectedParameterKey]; // Type is now inferred correctly
    useEffect(() => {
        if (!mapRef.current) return;

        const mapAreas = mapRef.current.querySelectorAll('.map-area');
        const nearestHour = getNearestTimeKey(selectedTime); // Use helper function
        const dataSet = mockData.timeBasedData[nearestHour]?.[selectedParameterKey]; // Optional chaining for safety
        const colorConfig = config[selectedParameterKey];

        if (!dataSet || !colorConfig) {
            console.warn("Data or config not found for selected parameter/time.");
            return;
        }

        mapAreas.forEach(area => {
            const areaId = area.id as keyof typeof dataSet;
            const level = dataSet[areaId] || 'low'; // Default value if level is missing
            const colorClass = colorConfig[level as keyof typeof colorConfig].color;

            // Remove all possible Tailwind fill classes before adding the new one
            // This list should be exhaustive based on your config to avoid lingering styles
            const allPossibleFillClasses = [
                'fill-green-400', 'fill-yellow-400', 'fill-red-500',
                'fill-blue-300', 'fill-yellow-300', 'fill-amber-300',
                'fill-sky-400', 'fill-orange-400', 'fill-fuchsia-600'
            ];
            area.classList.remove(...allPossibleFillClasses); // Spread operator to remove multiple classes
            area.classList.add(colorClass);

            // Saves the current level as a data attribute for the tooltip
            area.setAttribute('data-level', colorConfig[level as keyof typeof colorConfig].text);
        });
    }, [selectedParameterKey, selectedTime, mockData, config]); // Dependencies for useEffect to re-run when these change

    // Effect for tooltip handling
    useEffect(() => {
        if (!mapRef.current || !tooltipRef.current) return;

        const mapAreas = mapRef.current.querySelectorAll('.map-area');
        const tooltip = tooltipRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const area = e.currentTarget as SVGPathElement;
            const areaName = area.dataset.name;
            const currentLevel = area.dataset.level;
            // Get the display label for the selected parameter from senseOptions array
            const parameterLabel = senseOptions.find(opt => opt.value === selectedParameterKey)?.label || selectedParameterKey;

            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY + 15}px`;
            tooltip.innerHTML = `<strong>${areaName}</strong><br>${parameterLabel}: ${currentLevel}`;
        };

        const handleMouseLeave = () => {
            tooltip.style.display = 'none';
        };

        // Attach event listeners
        mapAreas.forEach(area => {
            area.addEventListener('mousemove', handleMouseMove);
            area.addEventListener('mouseleave', handleMouseLeave);
        });

        // Cleanup function: remove event listeners when component unmounts or dependencies change
        return () => {
            mapAreas.forEach(area => {
                area.removeEventListener('mousemove', handleMouseMove);
                area.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [selectedParameterKey]); // Rerun this effect if selectedParameterKey changes (to ensure tooltip text is up-to-date)

    return (
        <div className="bg-gray-200 rounded-lg p-4 relative"> {/* Relative positioning for tooltip */}
            <svg id="mappa-svg" viewBox="0 0 800 600" className="w-full h-auto" ref={mapRef}>
                {/* Simplified map of University of Oulu, Linnanmaa campus */}
                <path id="pegasus-library" className="map-area" data-name="Pegasus Library" d="M20,150 h250 v300 h-250 z" />
                <path id="tellus-arena" className="map-area" data-name="Tellus Innovation Arena" d="M290,20 h220 v250 h-220 z" />
                <path id="main-lobby" className="map-area" data-name="Main Lobby" d="M290,290 h220 v290 h-220 z" />
                <path id="restaurant-kastari" className="map-area" data-name="Restaurant Kastari" d="M20,20 h250 v110 h-250 z" />
                <path id="itee-faculty" className="map-area" data-name="Faculty of ITEE" d="M530,20 h250 v250 h-250 z" />
                <path id="lecture-halls" className="map-area" data-name="Lecture Halls (L-series)" d="M530,290 h250 v290 h-250 z" />

                {/* Text labels for the areas */}
                <text x="145" y="305" text-anchor="middle" className="font-semibold pointer-events-none">Pegasus Library</text>
                <text x="400" y="150" text-anchor="middle" className="font-semibold pointer-events-none">Tellus Arena</text>
                <text x="400" y="440" text-anchor="middle" className="font-semibold pointer-events-none">Main Lobby</text>
                <text x="145" y="80" text-anchor="middle" className="font-semibold pointer-events-none">Restaurant Kastari</text>
                <text x="655" y="150" text-anchor="middle" className="font-semibold pointer-events-none">Faculty of ITEE</text>
                <text x="655" y="440" text-anchor="middle" className="font-semibold pointer-events-none">Lecture Halls</text>
            </svg>
            {/* Tooltip that appears on hover */}
            <div id="tooltip" ref={tooltipRef} className="absolute hidden bg-gray-900 text-white p-2 rounded-md text-sm whitespace-nowrap pointer-events-none z-50"></div>
        </div>
    );
};


// --- Main App Component ---
function App() {
  const [selectedTime, setSelectedTime] = useState(8);
  // Default to 'noise' as it's the first option's value
  const [selectedParameterKey, setSelectedParameterKey] = useState<SenseOptionKey>("noise");

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-gray-100 p-4 font-sans">

      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-5xl mx-4 my-8"> {/* Adjusted max-w-5xl */}
        <header className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Dynamic University of Oulu Map</h1>
            <p className="text-gray-500 mt-1">Linnanmaa Campus - Real-Time Environmental Data</p>
        </header>

        <div className="w-full mb-6">
          <TimeSlider time={selectedTime} setTime={setSelectedTime} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-auto">
                <SenseSelector
                  options={senseOptions}
                  selectedValue={selectedParameterKey}
                  onValueChange={setSelectedParameterKey}
                  label="View by:"
                />
            </div>
            <Legend parameter={selectedParameterKey} config={config} />
        </div>

        <MapComponent
            selectedParameterKey={selectedParameterKey}
            selectedTime={selectedTime}
            mockData={mockData}
            config={config}
        />
      </div>
    </div>
  );
}

export default App;
