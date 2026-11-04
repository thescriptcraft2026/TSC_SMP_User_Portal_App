import time
import json
import urllib.request
import urllib.error
import sys
import jwt

KEY_ID = '6GSY2B58H6'
ISSUER_ID = 'ee4e274f-dc8e-4b30-addb-ac8abe8d436f'
KEY_FILE = '/Users/kirang/Downloads/AuthKey_6GSY2B58H6.p8'
APP_ID = '6757950789'
UPLOAD_ID = '8ba5c820-3f90-4f4c-bcf6-412418c3f15b'

with open(KEY_FILE, 'r') as f:
    private_key = f.read()

def get_token():
    payload = {
        'iss': ISSUER_ID,
        'exp': int(time.time()) + 1200,
        'aud': 'appstoreconnect-v1'
    }
    return jwt.encode(payload, private_key, algorithm='ES256', headers={'kid': KEY_ID})

def api_request(url, data=None, method='GET'):
    token = get_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"HTTPError {e.code} on {method} {url}: {err_msg}")
        raise

print("=== Starting TestFlight Build Monitor ===")
start_time = time.time()
target_build = None

while time.time() - start_time < 900: # 15 minutes max
    # 1. Check buildUpload status
    try:
        up_data = api_request(f'https://api.appstoreconnect.apple.com/v1/buildUploads/{UPLOAD_ID}')
        up_state = up_data.get('data', {}).get('attributes', {}).get('state', {})
        print(f"[{int(time.time() - start_time)}s] BuildUpload state: {up_state.get('state')}")
    except Exception as e:
        print(f"Error checking buildUpload: {e}")

    # 2. Check latest builds
    try:
        builds_data = api_request(f'https://api.appstoreconnect.apple.com/v1/builds?filter[app]={APP_ID}&sort=-uploadedDate&limit=5')
        for b in builds_data.get('data', []):
            attrs = b.get('attributes', {})
            ver = attrs.get('version')
            pstate = attrs.get('processingState')
            uploaded = attrs.get('uploadedDate')
            
            # Check if this is the new build 11 from today
            if ver == '11' and '2026-11' in uploaded:
                target_build = b
                print(f"Found new Build 11! ID: {b.get('id')}, State: {pstate}, Uploaded: {uploaded}")
                break
    except Exception as e:
        print(f"Error checking builds: {e}")

    if target_build:
        pstate = target_build.get('attributes', {}).get('processingState')
        if pstate == 'VALID':
            print(">>> BUILD 11 IS VALID AND READY! <<<")
            break
        elif pstate == 'FAILED':
            print(">>> BUILD 11 FAILED PROCESSING! <<<")
            sys.exit(1)
        else:
            print(f"Build 11 is currently '{pstate}'. Waiting 20 seconds...")
    else:
        print("Build 11 not yet in builds list. Waiting 20 seconds...")

    time.sleep(20)

if not target_build or target_build.get('attributes', {}).get('processingState') != 'VALID':
    print("Timed out or build not ready yet.")
    sys.exit(1)

build_id = target_build.get('id')
print(f"\n=== Linking Build {build_id} to Beta Groups ===")

# 3. Get beta groups
groups_data = api_request(f'https://api.appstoreconnect.apple.com/v1/apps/{APP_ID}/betaGroups')
groups = groups_data.get('data', [])

for g in groups:
    gid = g.get('id')
    gname = g.get('attributes', {}).get('name')
    is_internal = g.get('attributes', {}).get('isInternalGroup')
    print(f"Linking to Beta Group: '{gname}' (internal={is_internal}, id={gid})...")
    
    link_url = f'https://api.appstoreconnect.apple.com/v1/betaGroups/{gid}/relationships/builds'
    link_body = json.dumps({'data': [{'id': build_id, 'type': 'builds'}]}).encode('utf-8')
    try:
        api_request(link_url, data=link_body, method='POST')
        print(f"-> Successfully linked to group '{gname}'!")
    except urllib.error.HTTPError as e:
        # If already linked or conflict
        print(f"-> Notice for group '{gname}': {e}")
    except Exception as e:
        print(f"-> Unexpected error for group '{gname}': {e}")

print("\n=== All Beta Groups Configured! TestFlight Release Complete! ===")
