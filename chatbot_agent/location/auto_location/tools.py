import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
MCP_URL = "http://127.0.0.1:7001/location"

def find_nearby_hospitals(lat: float, lng: float, radius_m: int = 10000) -> str:
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:{radius_m},{lat},{lng});
      way["amenity"="hospital"](around:{radius_m},{lat},{lng});
      relation["amenity"="hospital"](around:{radius_m},{lat},{lng});
    );
    out center tags;
    """

    try:
        r = requests.post(
            OVERPASS_URL,
            data=query,
            headers={"User-Agent": "adk-auto-location"},
            timeout=20
        )
        r.raise_for_status()
        data = r.json()

        elements = data.get("elements", [])
        if not elements:
            return "No hospitals found within 10 km."

        results = []
        for e in elements:
            tags = e.get("tags", {})
            name = tags.get("name")
            if name:
                phone = tags.get("phone") or tags.get("contact:phone") or tags.get("emergency:phone") or "N/A"
                results.append({"name": name, "phone": phone})

        if not results:
            return "Hospitals found nearby, but details are unavailable."

        formatted_list = [f"• {r['name']} (Helpline: {r['phone']})" for r in results[:5]]
        return "Nearby hospitals (within 10 km):\n" + "\n".join(formatted_list)

    except Exception as e:
        return f"Could not fetch nearby hospitals: {e}"


def get_user_address() -> str:
    try:
        r = requests.get(MCP_URL, timeout=5)
        r.raise_for_status()
        data = r.json()

        if "error" in data:
            return "Location service error: " + data["error"]

        lat = data.get("lat")
        lng = data.get("lng")

        if lat is None or lng is None:
            return "Location service did not return coordinates."

        city = data.get("city")
        region = data.get("region")
        country = data.get("country")

        if city:
            address = f"{city}, {region}, {country}"
        else:
            address = f"Latitude {lat}, Longitude {lng}"

        hospitals = find_nearby_hospitals(lat, lng, radius_m=10000)
        return f"Your location: {address}\n\n{hospitals}"

    except Exception as e:
        return f"Location service error: {e}"