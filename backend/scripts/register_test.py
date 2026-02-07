import json
import urllib.request

url = 'http://127.0.0.1:8000/api/auth/'
payload = {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Password123",
    "confirm_password": "Password123",
    "role": "manager",
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        print(resp.read().decode())
except Exception as e:
    print('Request failed:', e)
