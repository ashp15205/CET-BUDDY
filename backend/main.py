from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd

app = FastAPI()

# Serve static frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

# --- Your existing logic ---
df = pd.read_csv("cutoff.csv")

@app.get("/dropdown-options")
def dropdown_options():
    return {
        "categories": sorted(df["Category"].dropna().unique().tolist()),
        "branches": sorted(df["Branch"].dropna().unique().tolist()),
        "colleges": sorted(df["College Name"].dropna().unique().tolist())
    }

@app.post("/predict")
def predict(payload: dict):
    percentile = float(payload.get("percentile", 0))
    category = payload.get("category", "")
    branch = payload.get("branch", "")
    college = payload.get("college", "")

    filtered = df[
        (df["Category"].str.upper() == category.upper()) &
        (df["Percentile"] <= percentile)
    ]

    if branch:
        filtered = filtered[filtered["Branch"].str.contains(branch, case=False, na=False)]
    if college:
        filtered = filtered[filtered["College Name"].str.contains(college, case=False, na=False)]

    result = filtered.sort_values(by="Percentile", ascending=False)[
        ["College Code", "College Name", "Branch", "Category", "Percentile"]
    ].to_dict(orient="records")

    return {"colleges": result}
