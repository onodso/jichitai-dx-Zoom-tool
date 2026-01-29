import os
import pandas as pd
import json

# Configuration
SOURCE_DIR = '../../data/source' # Assuming data is placed here
REPORT_FILE = 'validation_report.json'

REQUIRED_FILES = [
    '都道府県のDX進捗状況_都道府県比較.csv',
    '市区町村毎のDX進捗状況_市区町村比較.csv',
    '都道府県のDX進捗状況_行政手続のオンライン申請率.csv',
    '市区町村毎のDX進捗状況_行政手続のオンライン申請率.csv',
    'census_population.csv',
    'localgov_master_full.csv',
    'official_url_master.csv'
]

def validate_source_data():
    report = {
        'status': 'success',
        'files': {},
        'errors': []
    }
    
    # helper to check file existence
    if not os.path.exists(SOURCE_DIR):
        report['status'] = 'failure'
        report['errors'].append(f"Source directory not found: {SOURCE_DIR}")
        save_report(report)
        return

    # Check each file
    for filename in REQUIRED_FILES:
        filepath = os.path.join(SOURCE_DIR, filename)
        file_info = {'exists': False, 'rows': 0, 'columns': []}
        
        if os.path.exists(filepath):
            file_info['exists'] = True
            try:
                # Attempt to read CSV (handling generic encodings)
                try:
                    df = pd.read_csv(filepath, encoding='utf-8')
                except UnicodeDecodeError:
                    df = pd.read_csv(filepath, encoding='shift_jis')
                
                file_info['rows'] = len(df)
                file_info['columns'] = list(df.columns)
            except Exception as e:
                report['errors'].append(f"Error reading {filename}: {str(e)}")
        else:
            report['status'] = 'failure'
            report['errors'].append(f"Missing file: {filename}")
        
        report['files'][filename] = file_info

    save_report(report)
    print(json.dumps(report, indent=2, ensure_ascii=False))

def save_report(report):
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    validate_source_data()
