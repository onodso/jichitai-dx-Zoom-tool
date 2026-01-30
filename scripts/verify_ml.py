import requests
import json
import time

API_URL = "http://api:4000/api/proposals"

def wait_for_api():
    print("Waiting for API to be ready...")
    for i in range(30):
        try:
            requests.get("http://api:4000/")
            print("API is ready.")
            return True
        except:
            time.sleep(1)
    print("API timed out.")
    return False

def test_generate(name, code):
    print(f"\n--- Testing generation for {name} (Code: {code}) ---")
    try:
        start = time.time()
        response = requests.post(API_URL, json={"municipalityCode": code})
        elapsed = time.time() - start
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Title: {data.get('title')}")
            print(f"Tier: {data.get('tier')}")
            print(f"Time: {elapsed:.2f}s")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    if not wait_for_api():
        exit(1)

    # 1. Generate for Kyoto City (First time, should use Pattern/Gemini)
    test_generate("Kyoto City", "261009") 
    
    print("\nWaiting for Redis async set (if any)...")
    time.sleep(2)
    
    # 2. Generate for Nara City (Should be semantically similar to Kyoto)
    test_generate("Nara City", "292010")
