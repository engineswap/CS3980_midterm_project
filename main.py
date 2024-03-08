# uvicorn main:app --port 8000 --reload

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List
import uuid
from transformers import pipeline
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/frontend", StaticFiles(directory="./frontend"), name="frontend")

# Our data model for quotes
class Quote(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    text: str
    author: str

# Database
db: List[Quote] = []

# Load the LLM models
trump_generator = pipeline('text-generation', model='huggingtweets/realdonaldtrump')
biden_generator = pipeline('text-generation', model='huggingtweets/joebiden')

@app.get("/")
async def welcome() -> FileResponse:
    return FileResponse("./frontend/index.html")

# Create a new quote
@app.get("/generate-trump-quote/")
async def generate_trump_quote(prompt: str) -> JSONResponse:
    generated_text = trump_generator(prompt, num_return_sequences=1)[0]['generated_text']
    quote = Quote(text=generated_text, author="Donald Trump")
    db.append(quote)
    return JSONResponse(content={"quote": generated_text, "id": quote.id})

# Create a new quote
@app.get("/generate-biden-quote/")
async def generate_biden_quote(prompt: str) -> JSONResponse:
    generated_text = biden_generator(prompt, num_return_sequences=1)[0]['generated_text']
    quote = Quote(text=generated_text, author="Joe Biden")
    db.append(quote)
    return JSONResponse(content={"quote": generated_text, "id": quote.id})


# Read all quotes
@app.get("/quotes/", response_model=List[Quote])
async def get_all_quotes() -> List[Quote]:
    return db


# Delete a quote
@app.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str):
    for index, quote in enumerate(db):
        if quote.id == quote_id:
            del db[index]
            return {"message": "Quote deleted successfully"}
    raise HTTPException(status_code=404, detail="Quote not found")


# Update a quote
@app.put("/quotes/{quote_id}", response_model=Quote)
async def update_quote(quote_id: str, updated_quote: Quote):
    for index, quote in enumerate(db):
        if quote.id == quote_id:
            db[index].text = updated_quote.text
            db[index].author = updated_quote.author
            return db[index]
    raise HTTPException(status_code=404, detail="Quote not found")