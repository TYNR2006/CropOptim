import os
import pandas as pd
from sklearn.model_selection import train_test_split

def load_processed_data():
    base_path = os.path.join(os.path.dirname(__file__), "../../data")
    groundnut = pd.read_csv(os.path.join(base_path, "groundnut_processed.csv"))
    paddy = pd.read_csv(os.path.join(base_path, "paddy_processed.csv"))
    millets = pd.read_csv(os.path.join(base_path, "millets_processed.csv"))
    return groundnut, paddy, millets

def detect_target_column(df):
    for col in df.columns:
        if "yield" in col.lower():
            return col
    raise ValueError("No target column containing 'yield' found!")

def create_splits(df, target_column):
    X = df.drop(columns=[target_column])
    y = df[target_column]
    return train_test_split(X, y, test_size=0.2, random_state=42)

if __name__ == "__main__":
    groundnut_df, paddy_df, millets_df = load_processed_data()

    splits = {}
    for crop_name, df in [("groundnut", groundnut_df), ("paddy", paddy_df), ("millets", millets_df)]:
        target_col = detect_target_column(df)
        print(f"{crop_name}: detected target column → {target_col}")
        splits[crop_name] = create_splits(df, target_column=target_col)

    # Save splits
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "splits"))
    os.makedirs(base_path, exist_ok=True)

    for crop, (X_train, X_test, y_train, y_test) in splits.items():
        pd.DataFrame(X_train).to_csv(os.path.join(base_path, f"{crop}_X_train.csv"), index=False)
        pd.DataFrame(X_test).to_csv(os.path.join(base_path, f"{crop}_X_test.csv"), index=False)
        pd.DataFrame(y_train).to_csv(os.path.join(base_path, f"{crop}_y_train.csv"), index=False)
        pd.DataFrame(y_test).to_csv(os.path.join(base_path, f"{crop}_y_test.csv"), index=False)

    print(f"Dataset splitting complete. Splits saved in: {base_path}")
