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