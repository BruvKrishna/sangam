from app.data.data_store import store
from typing import List, Dict

def get_all_assets() -> List[Dict]:
    return [a.dict() for a in store.assets.values()]

def get_asset(asset_id: str) -> Dict:
    asset = store.assets.get(asset_id)
    return asset.dict() if asset else None
