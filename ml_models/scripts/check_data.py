import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load datasets
paddy_df = pd.read_csv("../../data/paddy_kadapa.csv")
groundnut_df = pd.read_csv("../../data/groundnut_kadapa.csv")
millets_df = pd.read_csv("../../data/millets_kadapa.csv")

print("📊 Dataset shapes:")
print("Paddy:", paddy_df.shape)
print("Groundnut:", groundnut_df.shape)
print("Millets:", millets_df.shape)

# Function to preprocess data
def preprocess(df):
    le = LabelEncoder()

    # Encode all categorical columns
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = le.fit_transform(df[col].astype(str))

    # Fill missing values for numeric columns only
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    return df

# Preprocess datasets
paddy_df = preprocess(paddy_df)
groundnut_df = preprocess(groundnut_df)
millets_df = preprocess(millets_df)

print("\n✅ Preprocessing complete.")

# Check first 5 rows
print("\n📄 Sample data:")
print("Paddy:")
print(paddy_df.head())
print("\nGroundnut:")
print(groundnut_df.head())
print("\nMillets:")
print(millets_df.head())
