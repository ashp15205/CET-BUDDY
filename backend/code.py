import pandas as pd

# Step 1: Load CSV files
df_23 = pd.read_csv("cutoff 23-24.csv")
df_24 = pd.read_csv("cutoff 24-25.csv")

# Step 2: Clean College Name and remove colons, quotes, semicolons
def clean_college_name(name):
    return str(name).replace('"', '').replace(':', '').replace(';', '').strip().rstrip(',')

df_23['College Name'] = df_23['College Name'].apply(clean_college_name)
df_24['College Name'] = df_24['College Name'].apply(clean_college_name)

# Step 3: Extract base college name (remove city)
df_23['Base Name'] = df_23['College Name'].str.extract(r'^(.+?)(?:,\s*[^,]+)?$')[0].str.strip()
df_24['Base Name'] = df_24['College Name'].str.extract(r'^(.+?)(?:,\s*[^,]+)?$')[0].str.strip()

# Step 4: Convert Percentile to numeric
df_23['Percentile'] = pd.to_numeric(df_23['Percentile'], errors='coerce')
df_24['Percentile'] = pd.to_numeric(df_24['Percentile'], errors='coerce')

# Step 5: Group by Base Name, Branch, Category
group_cols = ['Base Name', 'Branch', 'Category']
df_23_grouped = df_23.groupby(group_cols, as_index=False)['Percentile'].max().rename(columns={'Percentile': 'Percentile 23-24'})
df_24_grouped = df_24.groupby(group_cols, as_index=False)['Percentile'].max().rename(columns={'Percentile': 'Percentile 24-25'})

# Step 6: Merge both datasets on Base Name + Branch + Category
merged = pd.merge(df_24_grouped, df_23_grouped, on=group_cols, how='outer')

# Step 7: Optional — fill missing percentiles with "N/A"
merged[['Percentile 24-25', 'Percentile 23-24']] = merged[['Percentile 24-25', 'Percentile 23-24']].fillna("")

# Step 8: Rename base name to College Name
merged = merged.rename(columns={'Base Name': 'College Name'})

# Step 9: Save to file
merged.to_csv("percentile.csv", index=False)

print("✅ Saved as percentile.csv")
