hour_list = [10, 12, 14, 16]

area_name_map = {
    "UBI Cafe": "UBICafe",
    "PSOASLounge": "PSOASLounge",
    "Oulun normal high school": "WetteriSali",
    "Tellus": "Tellus",
    "Cafeteria Lipasto": "CafeteriaLipasto",
    "library pegasus": "LibraryPegasus",
    "Cafeteria julinia (oamk)": "CafeteriaJulinia",
}

area_names = [v for v in area_name_map.values()]


options_map = {
    "noise": "noise",
    "brightness": "brightness",
    "crowd": "crowd",
    "score_studying_alone": "score_study_alone",
    "score_group_study": "score_group_study",
    "score_lecture": "score_lecture",
    "score_commuting_waiting": "score_commuting_waiting",
    "score_event": "score_event",
}

options = [v for v in options_map.values()]


def api_frontend(data):

    return_data = {
        "hours": [
            {
                "hour": hour,
                "rooms": {
                    area: {
                        option: None for option in options
                    } for area in area_names
                }
            } for hour in hour_list
        ]
    }

    for hour_data in data["hours"]:
        hour = hour_data["hour"]
        rooms = return_data["hours"][hour_list.index(hour)]["rooms"]

        for area, area_data in hour_data["rooms"].items():
            area_name = area_name_map.get(area, area)
            if area_name not in rooms:
                continue
            for option, value in area_data.items():
                option_key = options_map.get(option, option)
                if option_key in rooms[area_name]:
                    rooms[area_name][option_key] = value

    return return_data


# if __name__ == "__main__":
#     import json
#     with open("../json_data/output.json", "r") as f:
#         data = json.load(f)
    
#     result = api_frontend(data)
#     with open("../json_data/api_output.json", "w") as f:
#         json.dump(result, f, indent=2)