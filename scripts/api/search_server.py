import os
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from typing import List, Optional

app = FastAPI()

# Paths
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, '../../data')
METADATA_PATH = os.path.join(DATA_DIR, 'cleaned/municipality_embedding_map.json')
EMBEDDINGS_PATH = os.path.join(DATA_DIR, 'cleaned/municipality_embeddings.npy')
MUNICIPALITIES_CSV = os.path.join(DATA_DIR, 'cleaned/municipalities_cleaned.csv')

# Globals
model = None
embeddings = None
municipality_codes = []
municipality_data = {}

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

@app.on_event("startup")
async def load_data():
    global model, embeddings, municipality_codes, municipality_data
    
    print("Loading resources...")
    
    # Load Model
    try:
        model = SentenceTransformer('pkshatech/GLuCoSE-base-ja')
    except Exception as e:
        print(f"Error loading model: {e}")
        # In production, we might want to fail hard, but for now log it
    
    # Load Embeddings
    if os.path.exists(EMBEDDINGS_PATH):
        embeddings = np.load(EMBEDDINGS_PATH)
        print(f"Embeddings loaded: {embeddings.shape}")
    else:
        print(f"Embeddings file not found at {EMBEDDINGS_PATH}")

    # Load Metadata (Mapping)
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
            # mapping is code -> index. Inverse it.
            index_to_code = {v: k for k, v in mapping.items()}
            # Verify indices are contiguous 0..N-1
            max_idx = max(mapping.values())
            municipality_codes = [index_to_code.get(i, "UNKNOWN") for i in range(max_idx + 1)]
            print(f"Metadata loaded: {len(municipality_codes)} items")
    
    # Load CSV for extra data if needed (Name, Prefecture)
    if os.path.exists(MUNICIPALITIES_CSV):
        try:
            df = pd.read_csv(MUNICIPALITIES_CSV)
            # Create a dict for quick lookup
            for _, row in df.iterrows():
                municipality_data[str(row['code'])] = {
                    "name": row['name'],
                    "prefecture": row['prefecture']
                }
            print(f"CSV Data loaded: {len(municipality_data)} items")
        except Exception as e:
            print(f"Error loading CSV: {e}")
            
    print("Resources loaded.")

@app.post("/search")
async def search(req: SearchRequest):
    if model is None:
         raise HTTPException(status_code=503, detail="Search service error: Model not loaded")
    if embeddings is None:
        raise HTTPException(status_code=503, detail="Search service error: Embeddings not loaded")
        
    try:
        query_embedding = model.encode(req.query)
        
        # Normalize query
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm
            
        # Cosine Similarity
        scores = np.dot(embeddings, query_embedding)
        
        # Top K
        # Get indices of top k scores
        top_indices = np.argsort(scores)[::-1][:req.top_k]
        
        results = []
        for idx in top_indices:
            if idx < len(municipality_codes):
                code = municipality_codes[idx]
                score = float(scores[idx])
                info = municipality_data.get(code, {})
                results.append({
                    "code": code,
                    "score": score,
                    "name": info.get("name", ""),
                    "prefecture": info.get("prefecture", "")
                })
            
        return {"results": results}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    status = "ok" if (model is not None and embeddings is not None) else "loading"
    return {"status": status}
