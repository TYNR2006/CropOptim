import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# Paths
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # project root
DATA_PATH = os.path.join(BASE_PATH, "data")  # CSV files here
MODELS_PATH = os.path.join(BASE_PATH, "ml_models", "models")  # models here

def load_models():
    return {
        "groundnut": joblib.load(os.path.join(MODELS_PATH, "groundnut_model.pkl")),
        "paddy": joblib.load(os.path.join(MODELS_PATH, "paddy_model.pkl")),
        "millets": joblib.load(os.path.join(MODELS_PATH, "millets_model.pkl"))
    }

def load_data():
    groundnut_df = pd.read_csv(os.path.join(DATA_PATH, "groundnut_kadapa.csv"))
    paddy_df = pd.read_csv(os.path.join(DATA_PATH, "paddy_kadapa.csv"))
    millets_df = pd.read_csv(os.path.join(DATA_PATH, "millets_kadapa.csv"))
    return groundnut_df, paddy_df, millets_df

def preprocess(df):
    le = LabelEncoder()
    for col in df.columns:
        if df[col].dtype == object:
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
    print("🔄 Loading models and data...")
    models = load_models()
    groundnut_df, paddy_df, millets_df = load_data()

    print("🔄 Preprocessing datasets...")
    groundnut_df = preprocess(groundnut_df)
    paddy_df = preprocess(paddy_df)
    millets_df = preprocess(millets_df)

    target_g = detect_target_column(groundnut_df)
    target_p = detect_target_column(paddy_df)
    target_m = detect_target_column(millets_df)

    print("⚙ Preparing meta-model training data...")
    X_meta = pd.DataFrame()
    y_meta = pd.Series(dtype=float)

    for df, model, target in [
        (groundnut_df, models["groundnut"], target_g),
        (paddy_df, models["paddy"], target_p),
        (millets_df, models["millets"], target_m)
    ]:
        X = df.drop(columns=[target])
        y = df[target]

        preds = model.predict(X)

        # Append predictions as new columns
        X_meta = pd.concat([X_meta, pd.DataFrame({f"{target}_pred": preds})], axis=0)
        y_meta = pd.concat([y_meta, y], ignore_index=True)

    # Reset indices
    X_meta = X_meta.reset_index(drop=True)
    y_meta = y_meta.reset_index(drop=True)

    print("🏋 Training ensemble meta-model...")
    meta_model = RandomForestRegressor(n_estimators=100, random_state=42)
    meta_model.fit(X_meta, y_meta)

    os.makedirs(MODELS_PATH, exist_ok=True)
    joblib.dump(meta_model, os.path.join(MODELS_PATH, "ensemble_model.pkl"))

    print("✅ Ensemble model trained and saved successfully!")
