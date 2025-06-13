import { useState }	from 'react';

import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Data from '../../../json_data/subjective_data.json';

const TimeOption = [10, 12, 14, 16];

const areaNameMap: Record<string, string> = {
  "UBI Cafe": "UBICafe",
  "PSOAS study / room 131": "PSOASLounge",
  "Oulun normal high school": "WetteriSali",
  "Tellus (nokia box)": "Tellus",
  "Cafeteria Lipasto": "CafeteriaLipasto",
  "library pegasus": "LibraryPegasus",
  "Cafeteria julinia (oamk)": "CafeteriaJulinia",
};

const reversedAreaNameMap: Record<string, string> = {
  "UBICafe": "UBI Cafe",
  "PSOASLounge": "PSOAS study / room 131",
  "WetteriSali": "Oulun normal high school",
  "Tellus": "Tellus (nokia box)",
  "CafeteriaLipasto": "Cafeteria Lipasto",
  "LibraryPegasus": "library pegasus",
  "CafeteriaJulinia": "Cafeteria julinia (oamk)",
};


const optionsMap: Record<string, string> = {
  score_studying_alone: "score_study_alone",
  score_group_study: "score_group_study",
  score_lecture: "score_lecture",
  score_commuting_waiting: "score_commuting_waiting",
  score_event: "score_event",
};

const options = Object.values(optionsMap);

const areaNames = Object.values(areaNameMap);

type scoreType = "score_studying_alone" | "score_group_study" | "score_lecture" | "score_commuting_waiting" | "score_event";
type plotAttributes = "perception_noise" | "perception_light" | "perception_smell" | "perception_crowd" | "overall_score";


type ScoreBarProps = {
  data: Record<string, number>;
};

type PlotDataProps = {
	[key in scoreType]: Record<plotAttributes, ScoreBarProps>;
};

const ScoreBar: React.FC<ScoreBarProps> = ({ 
	data 
}) => {
  const chartData = Object.entries(data).map(([rating, count]) => ({ rating, count }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="rating" label={{ value: 'rating', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'count', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

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


const StatisticPage: React.FC = () => {
	const { areaId } = useParams<{ areaId: string }>();
	const [time, setTime] = useState<number>(10);

  const areaName = areaId ? reversedAreaNameMap[areaId] || areaId : "Unknown Area";

  const plotData: PlotDataProps = Data.hours.find((d) => d.hour === time)?.rooms[areaName as keyof typeof Data.hours[0]['rooms']] || {};

	return (
    <div className="flex flex-col items-center p-5">
			<Link to="/map" className="text-blue-500 hover:underline mb-4 self-start">
				← Back
			</Link>
      <h1 className="font-semibold mb-4">Statistics for Area: {areaId}</h1>
			<h1>OverAll Score</h1>
			<TimeSlider time={time} setTime={setTime} />
			<div className="grid grid-cols-2 gap-4 w-full">
				{Object.keys(plotData).map((key) => (
					<div key={key} className="flex flex-col items-center">
						<h2 className="font-medium">{key}</h2>
						<ScoreBar data={plotData[key]["overall_score"]} />
					</div>
				))}
			</div>
    </div>
  );
};

export default StatisticPage;