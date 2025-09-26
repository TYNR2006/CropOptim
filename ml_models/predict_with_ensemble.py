import os
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import requests

# =================== PATH SETTINGS ===================
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_PATH = os.path.join(BASE_PATH, "ml_models", "models")

# =================== GLM SETTINGS ===================
API_KEY = "YOUR API KEY"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "z-ai/glm-4.5-air:free"

# =================== LOAD MODELS ===================
def load_models():
    return {
        "groundnut": joblib.load(os.path.join(MODELS_PATH, "groundnut_model.pkl")),
        "paddy": joblib.load(os.path.join(MODELS_PATH, "paddy_model.pkl")),
        "millets": joblib.load(os.path.join(MODELS_PATH, "millets_model.pkl")),
        "ensemble": joblib.load(os.path.join(MODELS_PATH, "ensemble_model.pkl"))
    }

# =================== PREPROCESS DATA ===================
def preprocess(df):
    le = LabelEncoder()
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = le.fit_transform(df[col].astype(str))
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    return df

# =================== FEATURE EXTRACTION ===================
def extract_features_from_question(question):
    try:
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {API_KEY}"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "You are an agricultural AI assistant that extracts numeric features for yield prediction."},
                    {"role": "user", "content": f"Extract numeric feature values from this question: {question}. Output them as comma-separated values."}
                ],
                "max_tokens": 300
            }
        )
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            return [float(x.strip()) for x in content.split(",") if x.strip().replace('.', '', 1).isdigit()]
        else:
            print(f"❌ GLM API error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error extracting features: {e}")
        return None

# =================== MAIN ===================
if __name__ == "__main__":
    question = input("💬 Farmer: ")

    print("🔄 Loading models...")
    models = load_models()

    column_names = models["groundnut"].feature_names_in_
    default_features = [50] * len(column_names)  # fallback values

    print("💡 Extracting features from question...")
    feature_values = extract_features_from_question(question)

    if not feature_values or len(feature_values) != len(column_names):
        print("⚠️ No valid numeric values found or mismatch in feature count, using default features.")
        feature_values = default_features

    new_data = pd.DataFrame([feature_values], columns=column_names)
    new_data = preprocess(new_data)

    preds = {}
    for crop in ["groundnut", "paddy", "millets"]:
        try:
            preds[crop] = models[crop].predict(new_data)
        except Exception as e:
            print(f"❌ Prediction error for {crop}: {e}")
            preds[crop] = [0]

    try:
        ensemble_feature_names = models["ensemble"].feature_names_in_
        ensemble_input = pd.DataFrame(
            [{ensemble_feature_names[i]: preds[crop][0] for i, crop in enumerate(["groundnut", "paddy", "millets"])}]
        )
        final_prediction = models["ensemble"].predict(ensemble_input)
    except Exception as e:
        print(f"❌ Ensemble prediction error: {e}")
        final_prediction = [0]

    print("💡 Getting explanation from GLM...")
    try:
        explanation_resp = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {API_KEY}"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "You are an expert AI explaining yield predictions."},
                    {"role": "user", "content": f"Explain the yield prediction result: {final_prediction}"}
                ],
                "max_tokens": 300
            }
        )
        explanation = explanation_resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        explanation = f"Could not fetch explanation: {e}"

    result = {
        "Prediction": final_prediction.tolist() if hasattr(final_prediction, "tolist") else final_prediction,
        "Explanation": explanation
    }

    print("\n✅ Final Result:")
    print(result)
