# terminal 1 - database
brew services start postgresql@17

# terminal 2 - backend
cd csoc/backend
python3.14 -m venv ../.venv       # first-time setup only
source ../.venv/bin/activate
pip install -r requirements.txt   # first-time setup only
uvicorn app.main:app --reload

# terminal 3 - frontend
cd csoc/frontend
npm run dev

# Push notifications (VAPID keys)
# Generate your own keypair locally - never commit real key material.
# VAPID_PRIVATE_KEY is PEM (used by pywebpush to sign requests).
# VAPID_PUBLIC_KEY must be the raw EC point, base64url-encoded (what the
# browser's pushManager.subscribe() expects as applicationServerKey).
python3 -c "
import base64
from py_vapid import Vapid
v = Vapid()
v.generate_keys()
print('VAPID_PRIVATE_KEY:')
print(v.private_pem().decode())
nums = v.public_key.public_numbers()
raw = b'\x04' + nums.x.to_bytes(32, 'big') + nums.y.to_bytes(32, 'big')
print('VAPID_PUBLIC_KEY:', base64.urlsafe_b64encode(raw).rstrip(b'=').decode())
"

# Save the output somewhere outside git (e.g. backend/.secrets/, already gitignored)
# and export both values before starting the backend.