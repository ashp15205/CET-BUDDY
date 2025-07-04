from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from predictor import load_df, get_eligible_colleges, get_dropdown_options

# Load the data globally once
df = load_df()

app = FastAPI()

# Enable CORS (for frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request schema
class UserInput(BaseModel):
    percentile: float
    category: str
    branch: str | None = None
    college: str | None = None

# POST: Predict eligible colleges
@app.post("/predict")
def predict(data: UserInput):
    results = get_eligible_colleges(
        df=df,
        percentile=data.percentile,
        category=data.category,
        branch=data.branch,
        college=data.college
    )
    return {"colleges": results}

# GET: Dropdown values for form fields
@app.get("/dropdown-options")
def dropdown_options():
    return JSONResponse(get_dropdown_options(df))
