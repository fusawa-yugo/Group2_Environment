const hourList: number[] = [10, 12, 14, 16];

const areaNameMap: Record<string, string> = {
  "UBI Cafe": "UBICafe",
  "PSOASLounge": "PSOASLounge",
  "Oulun normal high school": "WetteriSali",
  "Tellus": "Tellus",
  "Cafeteria Lipasto": "CafeteriaLipasto",
  "library pegasus": "LibraryPegasus",
  "Cafeteria julinia (oamk)": "CafeteriaJulinia",
};

const areaNames = Object.values(areaNameMap);

const optionsMap: Record<string, string> = {
  noise: "noise",
  brightness: "brightness",
  crowd: "crowd",
  score_studying_alone: "score_study_alone",
  score_group_study: "score_group_study",
  score_lecture: "score_lecture",
  score_commuting_waiting: "score_commuting_waiting",
  score_event: "score_event",
};

const options = Object.values(optionsMap);

interface InputData {
  hours: {
    hour: number; // updated type from Hour to number
    rooms: {
      [area: string]: {
        [option: string]: number | null;
      };
    };
  }[];
}


export function OrganizeData(data: InputData): {
    hours: {
        hour: number;
        rooms: Record<string, Record<string, number | null>>;
    }[];
} {
    const returnData: {
        hours: {
            hour: number;
            rooms: Record<string, Record<string, number | null>>;
        }[];
    } = {
        hours: hourList.map((hour) => ({
            hour,
            rooms: areaNames.reduce((acc, area) => {
                acc[area] = Object.fromEntries(options.map((opt) => [opt, null]));
                return acc;
            }, {} as Record<string, Record<string, number | null>>),
        })),
    };

    for (const hourData of data.hours) {
        const hourIndex = hourList.indexOf(hourData.hour);
        if (hourIndex === -1) continue;

        const rooms = returnData.hours[hourIndex].rooms;

        for (const [area, areaData] of Object.entries(hourData.rooms)) {
            const areaName = areaNameMap[area] ?? area;
            if (!(areaName in rooms)) continue;

            for (const [option, value] of Object.entries(areaData)) {
                const optionKey = optionsMap[option] ?? option;
                if (optionKey in rooms[areaName]) {
                    rooms[areaName][optionKey] = value;
                }
            }
        }
    }

    return returnData;
}
