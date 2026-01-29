import yaml

# Defines the mapping between Source CSV columns and Target Table columns
# This would ideally be dynamic, but for this task we define a static initial mapping template
# based on the expected CSV structure.

SCHEMA_MAPPING = {
    'municipalities': {
        'source_file': 'localgov_master_full.csv',
        'columns': {
            'municipality_id': 'code', # Assumed column name
            'name': 'name',
            'prefecture': 'prefecture',
            'population': 'population',
            'budget': 'budget',
            # Add more mappings as verified
        }
    },
    'dx_progress': {
        'source_file': '市区町村毎のDX進捗状況_市区町村比較.csv',
        'columns': {
             'municipality_id': '団体コード',
             'score': '総合スコア' # Assumed
        }
    }
}

def create_schema_mapping():
    with open('schema_mapping.yaml', 'w', encoding='utf-8') as f:
        yaml.dump(SCHEMA_MAPPING, f, allow_unicode=True)
    print("Created schema_mapping.yaml")

if __name__ == '__main__':
    create_schema_mapping()
