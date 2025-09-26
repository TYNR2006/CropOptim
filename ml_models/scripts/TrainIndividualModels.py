import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
from sklearn.preprocessing import LabelEncoder

def load_data():
    base_path = os.path.join(os.path.dirname(__file__), "../../data")
    groundnut = pd.read_csv(os.path.join(base_path, "groundnut_kadapa.csv"))
    paddy = pd.read_csv(os.path.join(base_path, "paddy_kadapa.csv"))
    millets = pd.read_csv(os.path.join(base_path, "millets_kadapa.csv"))
    return groundnut, paddy, millets

def preprocess_data(df):
    le = LabelEncoder()

    for col in df.columns:
        if df[col].dtype == object:  # detect categorical columns
            df[col] = le.fit_transform(df[col].astype(str))

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

    splits = {
        "groundnut": preprocess_data(groundnut_df),
        "paddy": preprocess_data(paddy_df),
        "millets": preprocess_data(millets_df),
    }

    models_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    os.makedirs(models_path, exist_ok=True)

    for crop, df in splits.items():
        target_col = detect_target_column(df)
        X = df.drop(columns=[target_col])
        y = df[target_col]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        joblib.dump(model, os.path.join(models_path, f"{crop}_model.pkl"))
        print(f"✅ Model trained and saved for {crop}")
