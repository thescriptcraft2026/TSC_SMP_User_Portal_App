import time, json, urllib.request, sys
import jwt

KEY_ID = '6GSY2B58H6'
ISSUER_ID = 'ee4e274f-dc8e-4b30-addb-ac8abe8d436f'
KEY_FILE = '/Users/kirang/Downloads/AuthKey_6GSY2B58H6.p8'

with open(KEY_FILE, 'r') as f:
    private_key = f.read()

payload = {
    'iss': ISSUER_ID,
    'exp': int(time.time()) + 1200,
    'aud': 'appstoreconnect-v1'
}

token = jwt.encode(payload, private_key, algorithm='ES256', headers={'kid': KEY_ID})

# 2. Check builds list sorted by uploadedDate descending
url2 = 'https://api.appstoreconnect.apple.com/v1/builds?filter[app]=6757950789&limit=5&sort=-uploadedDate'
req2 = urllib.request.Request(url2, headers={
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req2) as resp:
        data2 = json.loads(resp.read().decode('utf-8'))
        for b in data2.get('data', []):
            attrs2 = b.get('attributes', {})
            ver = attrs2.get('version')
            uploaded = attrs2.get('uploadedDate')
            state = attrs2.get('processingState')
            print(f"Build ID: {b.get('id')}, Version/Build: {ver}, State: {state}, Uploaded: {uploaded}")
            if ver == '8':
                print('>>> NEW BUILD 8 IS IN BUILDS LIST! State:', state)
                sys.exit(0)
except Exception as e:
    print('builds error:', e)
