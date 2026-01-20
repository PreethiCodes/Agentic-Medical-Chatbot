import requests

MCP_URL = "http://127.0.0.1:7001/location"

def fetch_location_from_mcp():
    try:
        r = requests.get(MCP_URL, timeout=5)
        r.raise_for_status()
        data = r.json()
        return {
            "lat": data.get("lat"),
            "lng": data.get("lng"),
        }
    except Exception:
        return None