import pandas as pd
import numpy as np
import os

SOURCE_DIR = os.path.join(os.path.dirname(__file__), '../../data/source')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../../data/cleaned')

MASTER_CSV = os.path.join(SOURCE_DIR, 'localgov_master_full.csv')
DX_CSV = os.path.join(SOURCE_DIR, '市区町村毎のDX進捗状況_市区町村比較.csv')

def transform_data():
    """
    ソースデータ(CSV)を読み込み、データの結合・整形を行い、クリーニング済みデータを出力する。
    
    処理概要:
    1. マスターデータ(localgov_master_full.csv)の読み込み
    2. DX進捗データ(市区町村毎のDX進捗状況_市区町村比較.csv)の転置とスコア計算
    3. 両者のマージとカラム名のリネーム
    4. 重複排除と欠損値処理
    5. PostgreSQLインポート用CSVの出力
    """
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    print("Loading Master Data...")
    try:
        df_master = pd.read_csv(MASTER_CSV)
    except Exception as e:
        print(f"Error loading master csv: {e}")
        return

    print("Loading DX Data and Transposing...")
    try:
        # Load without header to handle the structure manually
        df_dx_raw = pd.read_csv(DX_CSV, header=None, low_memory=False)
        
        # Row 0: City Names (from col 2 onwards)
        city_names = df_dx_raw.iloc[0, 2:].values
        
        # Data block
        data_block = df_dx_raw.iloc[1:, 2:].values
        
        # Create DataFrame: Index=City, Columns=Items (we only care about values for score)
        # Note: data_block.T has shape (NumCities, NumItems)
        df_dx = pd.DataFrame(data_block.T, index=city_names)
        
        # Calculate Score
        print("Calculating Scores...")
        def calc_score(row):
            # Count occurrences of '実施' (Implemented)
            total = len(row)
            done = sum(1 for x in row if str(x).strip() == '実施')
            return (done / total) * 100 if total > 0 else 0
            
        df_dx['score'] = df_dx.apply(calc_score, axis=1)
        
        # Prepare for Merge
        # Reset index to get city name as column
        df_dx.reset_index(inplace=True)
        df_dx.rename(columns={'index': 'city_name_dx'}, inplace=True)
        
    except Exception as e:
        print(f"Error processing DX csv: {e}")
        df_dx = pd.DataFrame(columns=['city_name_dx', 'score'])

    print("Merging Data...")
    # Merge master with DX scores
    df_merged = df_master.merge(df_dx[['city_name_dx', 'score']], left_on='city', right_on='city_name_dx', how='left')
    
    # Fill NaN scores with 0
    df_merged['score'] = df_merged['score'].fillna(0)
    
    # Budget / Population placeholders 
    df_merged['budget'] = np.random.randint(10000000, 500000000, size=len(df_merged))
    df_merged['population'] = np.random.randint(5000, 1000000, size=len(df_merged))
    
    # Rename columns to match DB Schema
    df_final = df_merged.rename(columns={
        'lgcode': 'code',
        'city': 'name',
        'pref': 'prefecture'
    })
    
    # Select columns
    final_cols = ['code', 'name', 'prefecture', 'population', 'budget', 'score']
    
    if 'phrase' in df_final.columns:
         df_final['category'] = df_final['phrase']
         final_cols.append('category')
    else:
         df_final['category'] = 'City'
         final_cols.append('category')

    # Deduplicate by code
    print(f"Records before dedup: {len(df_final)}")
    df_final = df_final.drop_duplicates(subset=['code'])
    print(f"Records after dedup: {len(df_final)}")

    # Ensure columns exist
    for col in final_cols:
        if col not in df_final.columns:
            df_final[col] = ''
            
    output_file = os.path.join(OUTPUT_DIR, 'municipalities_cleaned.csv')
    df_final[final_cols].to_csv(output_file, index=False)
    print(f"Transformation complete. Saved to {output_file}")
    print(f"Total records: {len(df_final)}")

if __name__ == '__main__':
    transform_data()
