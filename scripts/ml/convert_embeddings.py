import numpy as np
import json
import os

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, '../../data')
NPY_PATH = os.path.join(DATA_DIR, 'cleaned/municipality_embeddings.npy')
JSON_PATH = os.path.join(DATA_DIR, 'cleaned/municipality_vectors.json')

def convert():
    print("Loading NPY...")
    if not os.path.exists(NPY_PATH):
        print("NPY file not found")
        return

    vectors = np.load(NPY_PATH)
    print(f"Loaded vectors shape: {vectors.shape}")
    
    # Convert to list of lists
    vector_list = vectors.tolist()
    
    print("Saving as JSON...")
    with open(JSON_PATH, 'w') as f:
        json.dump(vector_list, f)
    
    print(f"Saved to {JSON_PATH}")

if __name__ == '__main__':
    convert()
