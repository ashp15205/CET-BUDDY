import re
import pandas as pd
import numpy as np

# Load CSV only once and reuse
def load_df():
    return pd.read_csv("cutoff.csv")

def get_eligible_colleges(df, percentile, category, branch=None, college=None):
    # Filter by category and percentile
    filtered = df[
        (df["Category"].str.upper() == category.upper()) &
        (df["Percentile"] <= percentile)
    ]

    # Optional branch filter
    if branch:
        filtered = filtered[filtered["Branch"].str.contains(branch, case=False, na=False, regex=False)]

    # Optional college filter
    if college:
        pattern = re.escape(college)
        filtered = filtered[filtered["College Name"].str.contains(pattern, case=False, na=False)]

    # Replace NaN with None before converting to dict
    cleaned = filtered[["College Code", "College Name", "Branch", "Category", "Percentile"]].replace({np.nan: None})

    return cleaned.sort_values(by="Percentile", ascending=False).to_dict(orient="records")

def get_dropdown_options(df):
    return {
        "categories": sorted(df["Category"].dropna().unique().tolist()),
        "colleges": sorted(df["College Name"].dropna().unique().tolist()),
        "branches": sorted(df["Branch"].dropna().unique().tolist())
    }
