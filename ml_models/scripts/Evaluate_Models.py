import os
import pandas as pd
from sklearn.model_selection import train_test_split
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
    # Heuristic: find the column containing 'yield' (case insensitive)
    for col in df.columns:
        if "yield" in col.lower():
            return col
    raise ValueError("No target column containing 'yield' found in dataset!")

def create_splits(df, target_column):
    X = df.drop(columns=[target_column])
    y = df[target_column]
    return train_test_split(X, y, test_size=0.2, random_state=42)

if __name__ == "__main__":
    groundnut_df, paddy_df, millets_df = load_data()

    groundnut_df = preprocess_data(groundnut_df)
    paddy_df = preprocess_data(paddy_df)
    millets_df = preprocess_data(millets_df)

    splits = {}
    for crop_name, df in [("groundnut", groundnut_df), ("paddy", paddy_df), ("millets", millets_df)]:
        target_col = detect_target_column(df)
        print(f"{crop_name}: detected target column → {target_col}")
        splits[crop_name] = create_splits(df, target_column=target_col)

    # Example evaluation loop
    for crop, (X_train, X_test, y_train, y_test) in splits.items():
        print(f"Evaluating model for: {crop}")
        print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")
        # Add your model loading and evaluation logic here
