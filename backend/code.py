import pandas as pd

# Step 1: Load both CSV files
df_cutoff = pd.read_csv("cutoff 24-25.csv")
df_generated = pd.read_csv("cutoff 23-24.csv")

# Step 2: Clean the Category column (remove .1, .2, etc.)
df_cutoff['Category'] = df_cutoff['Category'].astype(str).str.replace(r'\.\d+$', '', regex=True)
df_generated['Category'] = df_generated['Category'].astype(str).str.replace(r'\.\d+$', '', regex=True)

# Step 3: Convert percentiles to numeric and handle errors
df_cutoff['Percentile'] = pd.to_numeric(df_cutoff['Percentile'], errors='coerce')
df_generated['Percentile'] = pd.to_numeric(df_generated['Percentile'], errors='coerce')

# Step 4: Group both dataframes by the 4 keys and take max percentile
df_cutoff = df_cutoff.groupby(
    ['College Code', 'College Name', 'Branch', 'Category'], as_index=False
).agg({'Percentile': 'max'})

df_generated = df_generated.groupby(
    ['College Code', 'College Name', 'Branch', 'Category'], as_index=False
).agg({'Percentile': 'max'}).rename(columns={'Percentile': 'Percentile 2'})

# Step 5: Merge on all 4 key columns
merged = pd.merge(
    df_cutoff,
    df_generated,
    on=['College Code', 'College Name', 'Branch', 'Category'],
    how='outer'  # keep all rows
)

# Step 6: Replace NaN with empty string for readability
merged[['Percentile', 'Percentile 2']] = merged[['Percentile', 'Percentile 2']].fillna('')

# Step 7: Save result to CSV
merged.to_csv("percentile.csv", index=False)

print("✅ File saved: percentile.csv")
