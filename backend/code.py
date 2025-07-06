import pandas as pd

# Load your CSV file
df = pd.read_excel('converted_file.xlsx')  # Replace with your actual file name

# Save as CSV
df.to_csv("category_updated.csv", index=False)

print("✅ Excel file successfully converted to 'category_updated.csv'")
