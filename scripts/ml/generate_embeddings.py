import os
import pandas as pd
import numpy as np
import json
from sentence_transformers import SentenceTransformer

# Paths
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, '../../data')
Cleaned_CSV = os.path.join(DATA_DIR, 'cleaned/municipalities_cleaned.csv')
OUTPUT_EMBEDDINGS = os.path.join(DATA_DIR, 'cleaned/municipality_embeddings.npy')
OUTPUT_METADATA = os.path.join(DATA_DIR, 'cleaned/municipality_embedding_map.json')

def generate_embeddings():
    print("Loading Cleaned Municipality Data...")
    if not os.path.exists(Cleaned_CSV):
        print(f"File not found: {Cleaned_CSV}")
        return

    df = pd.read_csv(Cleaned_CSV)
    
    # Text Construction for Embedding
    # Combine Name, Prefecture, Category, and Phrase (if available, handled in preprocessing)
    # df['category'] used as proxy for Phrase/Characteristics
    df['text_for_embedding'] = df.apply(lambda row: f"{row['prefecture']}{row['name']} 特徴:{row['category']}", axis=1)
    
    sentences = df['text_for_embedding'].tolist()
    ids = df['code'].astype(str).tolist()
    
    print(f"Loading Sentence Transformer Model (pkshatech/GLuCoSE-base-ja)...")
    try:
        # User requested high accuracy: using GLuCoSE (PKSHA Technology)
        model = SentenceTransformer('pkshatech/GLuCoSE-base-ja')
    except Exception as e:
        print(f"Failed to load model from Hub: {e}")
        # Fallback or exit
        return

    print(f"Generating Embeddings for {len(sentences)} municipalities...")
    embeddings = model.encode(sentences)
    
    # Normalization for Cosine Similarity
    # Creating unit vectors
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeddings = embeddings / norms
    
    print(f"Saving Embeddings shape: {normalized_embeddings.shape}...")
    np.save(OUTPUT_EMBEDDINGS, normalized_embeddings)
    
    # Save ID mapping
    mapping = {code: idx for idx, code in enumerate(ids)}
    with open(OUTPUT_METADATA, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False)
        
    print("Embedding Generation Complete.")

if __name__ == '__main__':
    generate_embeddings()
