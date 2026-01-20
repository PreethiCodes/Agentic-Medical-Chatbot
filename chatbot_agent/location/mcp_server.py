from fastapi import FastAPI
import requests

app = FastAPI()

@app.get("/location")
def get_location():
    """
    Auto-detect user location using IP-based geolocation.
    """
    try:
        r = requests.get("https://ipwho.is/", timeout=5)
        data = r.json()

        if not data.get("success"):
            return {"error": "Unable to detect location"}

        lat = data.get("latitude")
        lng = data.get("longitude")

        if lat is None or lng is None:
            return {"error": "No coordinates returned"}

        return {
            "lat": lat,
            "lng": lng,
            "city": data.get("city"),
            "region": data.get("region"),
            "country": data.get("country"),
        }

    except Exception as e:
        return {"error": str(e)}