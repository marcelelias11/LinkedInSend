from flask import Flask, request, jsonify, send_from_directory, redirect, session, url_for
from config_manager import ConfigManager
import yaml
from pathlib import Path
from main import create_and_run_bot
import os
import json
import requests
from jose import jwt
from urllib.parse import urlencode

app = Flask(__name__, static_url_path='')
app.secret_key = os.urandom(24)

config = ConfigManager()
credentials = config.load_credentials()

LINKEDIN_CLIENT_ID = credentials.get('linkedin_client_id', '')
LINKEDIN_CLIENT_SECRET = credentials.get('linkedin_client_secret', '')
LINKEDIN_REDIRECT_URI = f"https://{os.environ.get('REPL_SLUG')}.{os.environ.get('REPL_OWNER')}.repl.co/linkedin/callback" if os.environ.get('REPL_SLUG') else "http://localhost:5000/linkedin/callback"

@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')

@app.route('/api/config', methods=['POST'])
def update_config():
    try:
        data = request.get_json()
        with open(DATA_FOLDER / 'config.yaml', 'w') as f:
            yaml.dump(data, f)
        return jsonify({"message": "Config updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/secrets', methods=['POST'])
def update_secrets():
    try:
        data = request.get_json()
        with open(DATA_FOLDER / 'secrets.yaml', 'w') as f:
            yaml.dump(data, f)
        return jsonify({"message": "Secrets updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume', methods=['POST'])
def update_resume():
    try:
        data = request.get_json()
        with open(DATA_FOLDER / 'plain_text_resume.yaml', 'w') as f:
            yaml.dump(data, f)
        return jsonify({"message": "Resume updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/start', methods=['GET'])
def start_application():
    try:
        with app.app_context():
            # Run the bot
            create_and_run_bot()
            return jsonify({
                "status": "completed",
                "message": "Application completed successfully"
            }), 200
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

DATA_FOLDER = Path("data_folder")
DATA_FOLDER.mkdir(exist_ok=True)

@app.route('/linkedin/login')
def linkedin_login():
    params = {
        'response_type': 'code',
        'client_id': LINKEDIN_CLIENT_ID,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'scope': 'openid profile email',
        'state': os.urandom(16).hex()
    }
    session['oauth_state'] = params['state']
    auth_url = f"https://www.linkedin.com/oauth/v2/authorization?{urlencode(params)}"
    return redirect(auth_url)

@app.route('/linkedin/callback')
def linkedin_callback():
    if request.args.get('state') != session.get('oauth_state'):
        return 'State verification failed', 400

    code = request.args.get('code')
    token_response = requests.post('https://www.linkedin.com/oauth/v2/accessToken', data={
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': LINKEDIN_CLIENT_ID,
        'client_secret': LINKEDIN_CLIENT_SECRET,
        'redirect_uri': LINKEDIN_REDIRECT_URI
    })

    if token_response.status_code != 200:
        return 'Token exchange failed', 400

    tokens = token_response.json()

    # Get user info
    user_response = requests.get('https://api.linkedin.com/v2/userinfo', 
        headers={'Authorization': f"Bearer {tokens['access_token']}"})

    if user_response.status_code != 200:
        return 'Failed to get user info', 400

    user_info = user_response.json()

    return f"""
        <script>
            window.opener.postMessage({{ 
                type: 'LINKEDIN_AUTH_SUCCESS',
                token: {json.dumps(tokens)},
                user: {json.dumps(user_info)}
            }}, '*');
            window.close();
        </script>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)