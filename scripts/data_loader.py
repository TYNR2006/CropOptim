import pandas as pd
import os

def load_data():
    base_path = os.path.join(os.path.dirname(__file__), "../data/raw")
    groundnut = pd.read_csv(os.path.join(base_path, "groundnut_kadapa.csv"))
    paddy = pd.read_csv(os.path.join(base_path, "paddy_kadapa.csv"))
    millets = pd.read_csv(os.path.join(base_path, "millets_kadapa.csv"))

    return groundnut, paddy, millets

if __name__ == "__main__":
    g, p, m = load_data()
    print("Groundnut data shape:", g.shape)
    print("Paddy data shape:", p.shape)
    print("Millets data shape:", m.shape)
