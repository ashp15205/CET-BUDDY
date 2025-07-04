import pandas as pd

# Load your Excel file
excel_file = "cutoff.xlsx"  # Change this to your Excel file name
sheet_name = 0  # Use sheet name or index if multiple sheets

# Read the sheet into a DataFrame
df = pd.read_excel(excel_file, sheet_name=sheet_name)

# Save to CSV
df.to_csv("cutoff.csv", index=False)

print("✅ Excel successfully converted to cutoff.csv")
