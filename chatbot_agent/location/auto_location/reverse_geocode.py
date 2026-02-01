from geopy.geocoders import Nominatim

_geolocator = Nominatim(user_agent="adk_auto_location")

def reverse_geocode(lat: float, lng: float) -> str:
    try:
        loc = _geolocator.reverse((lat, lng), exactly_one=True)
        return loc.address if loc else "Unknown location"
    except Exception:
        return "Unable to resolve address"