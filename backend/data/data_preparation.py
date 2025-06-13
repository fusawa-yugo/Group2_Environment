import pandas as pd
import json
from config import ACTIVITIES

def organize_data(noise_data, light_data, esms_data, hours_interval):
    print("HIIIIIII")
    df_noise = pd.DataFrame(noise_data)
    df_light = pd.DataFrame(light_data)
    df_esms = pd.DataFrame(esms_data)
    
    print(df_esms.head())

    df_esms['timestamp'] = pd.to_datetime(df_esms['timestamp'], unit='ms')  # o 's' se in secondi
    df_noise['timestamp'] = pd.to_datetime(df_noise['timestamp'], unit='ms')
    df_light['timestamp'] = pd.to_datetime(df_light['timestamp'], unit='ms')
    df_noise = df_noise.sort_values(by='timestamp')
    df_esms = df_esms.sort_values(by='timestamp')
    df_light = df_light.sort_values(by='timestamp')

    # Merge dfs
    merged = pd.merge_asof(df_esms, df_noise, on='timestamp', by='device_id', direction='nearest', tolerance=pd.Timedelta(minutes=10))
    merged = merged.dropna()
    merged = pd.merge_asof(merged, df_light, on='timestamp', by='device_id', direction='nearest', tolerance=pd.Timedelta(minutes=10))
    merged = merged.dropna()

    merged['esm_title'] = merged['esm_json'].apply(lambda x: json.loads(x)['esm_title'])
    merged['esm_number'] = merged['esm_json'].apply(lambda x: json.loads(x)['id'])

    df_sorted = merged.sort_values('timestamp').reset_index(drop=True)

    rows = []
    buffer = []
    for _, row in df_sorted.iterrows():
        esm_num = row['esm_number']
        buffer.append(row)
        if esm_num == 7:
            temp_df = pd.DataFrame(buffer)
            location = temp_df[temp_df['esm_number'] == 1]['esm_user_answer'].values[0]
            activity = temp_df[temp_df['esm_number'] == 2]['esm_user_answer'].values[0]
            light_perception = temp_df[temp_df['esm_number'] == 3]['esm_user_answer'].values[0]
            noise_perception = temp_df[temp_df['esm_number'] == 4]['esm_user_answer'].values[0]
            crowdness_perception = temp_df[temp_df['esm_number'] == 5]['esm_user_answer'].values[0]
            smell = temp_df[temp_df['esm_number'] == 6]['esm_user_answer'].values[0]
            score = temp_df[temp_df['esm_number'] == 7]['esm_user_answer'].values[0]
            noise = temp_df['double_decibels'].mean()
            light = temp_df['double_frequency'].mean()
            rows.append({
                'Location': location,
                'Activity': activity,
                'Noise': noise,
                'Light': light,
                'Noise_perception': noise_perception,
                'Light_perception': light_perception,
                'Crowdness_perception': crowdness_perception,
                'Smell_perception': smell,
                'Score': score
            })
            buffer = []

    final_df = pd.DataFrame(rows)
    if final_df.empty:
    	print("Nessun questionario completo (esm_number == 7) trovato.")
    	return None  # o un dizionario vuoto, come preferisci

    final_df['Noise_perception'] = pd.to_numeric(final_df['Noise_perception'], errors='coerce')
    final_df['Light_perception'] = pd.to_numeric(final_df['Light_perception'], errors='coerce')
    final_df['Crowdness_perception'] = pd.to_numeric(final_df['Crowdness_perception'], errors='coerce')
    final_df['Smell_perception'] = pd.to_numeric(final_df['Smell_perception'], errors='coerce')
    final_df['Score'] = pd.to_numeric(final_df['Score'], errors='coerce')

    noise = final_df.groupby('Location', as_index=False)['Noise'].mean()
    light = final_df.groupby('Location', as_index=False)['Light'].mean()
    objective_data = pd.merge(noise, light, on='Location')

    # Normalize data
    a, b = 0, 1
    x_min_noise = 45
    x_max_noise = 65
    x_min_light = 0
    x_max_light = 500
    objective_data['Noise_norm'] = a + (objective_data['Noise'] - x_min_noise) / (x_max_noise - x_min_noise) * (b - a)
    objective_data['Light_norm'] = a + (objective_data['Light'] - x_min_light) / (x_max_light - x_min_light) * (b - a)

    perception_noise = final_df.groupby(['Location'], as_index=False)['Noise_perception'].mean()
    perception_light = final_df.groupby(['Location'], as_index=False)['Light_perception'].mean()
    perception_smell = final_df.groupby(['Location'], as_index=False)['Smell_perception'].mean()
    perception_crowd = final_df.groupby(['Location'], as_index=False)['Crowdness_perception'].mean()
    perception_score = final_df.groupby(['Location', 'Activity'], as_index=False)['Score'].mean()

    rooms = {}
    for loc in perception_noise['Location'].unique():
        room_data = {
            "noise": float(objective_data[objective_data['Location'] == loc]['Noise_norm'].values[0]),
            "brightness": float(objective_data[objective_data['Location'] == loc]['Light_norm'].values[0]),
            "crowd": float(perception_crowd[perception_crowd['Location'] == loc]['Crowdness_perception'].values[0]),
        }

        for key, value in ACTIVITIES.items():
            score_row = perception_score[(perception_score['Location'] == loc) & (perception_score['Activity'] == value)]
            score_val = float(score_row['Score'].values[0]) if not score_row.empty else None
            room_data[f'score_{activity}'] = score_val

        rooms[loc] = room_data

    return {
        "hour": hours_interval,
        "rooms": rooms
    }
