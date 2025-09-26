import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder

def load_data():
    base_path = os.path.join(os.path.dirname(__file__), "../../data")
    groundnut = pd.read_csv(os.path.join(base_path, "groundnut_kadapa.csv"))
    paddy = pd.read_csv(os.path.join(base_path, "paddy_kadapa.csv"))
    millets = pd.read_csv(os.path.join(base_path, "millets_kadapa.csv"))
    return groundnut, paddy, millets

def preprocess_data(df):
    le_region = LabelEncoder()
    le_farming = LabelEncoder()

    if 'region' in df.columns:
        df['region'] = le_region.fit_transform(df['region'].astype(str))
    if 'farming_type' in df.columns:
        df['farming_type'] = le_farming.fit_transform(df['farming_type'].astype(str))

    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    return df

def detect_target_column(df):
    for col in df.columns:
        if "yield" in col.lower():
            return col
    raise ValueError("No target column containing 'yield' found!")

if __name__ == "__main__":
    groundnut_df, paddy_df, millets_df = load_data()

    groundnut_df = preprocess_data(groundnut_df)
    paddy_df = preprocess_data(paddy_df)
    millets_df = preprocess_data(millets_df)

    # Save processed data for future use
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "processed"))
    os.makedirs(base_path, exist_ok=True)

    groundnut_df.to_csv(os.path.join(base_path, "groundnut_processed.csv"), index=False)
    paddy_df.to_csv(os.path.join(base_path, "paddy_processed.csv"), index=False)
    millets_df.to_csv(os.path.join(base_path, "millets_processed.csv"), index=False)

    print(f"Preprocessing complete. Processed files saved in: {base_path}")
