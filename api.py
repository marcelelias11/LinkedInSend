from flask import Flask, request, jsonify, send_from_directory, redirect, session
from requests_oauthlib import OAuth2Session
import yaml
from pathlib import Path
from main import create_and_run_bot

app = Flask(__name__, static_url_path='')

@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')

DATA_FOLDER = Path("data_folder")
DATA_FOLDER.mkdir(exist_ok=True)

@app.route('/')
def status():
    return jsonify({"status": "running"}), 200

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
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

# LinkedIn OAuth Configuration (Replace with your actual values)
LINKEDIN_CLIENT_ID = "YOUR_LINKEDIN_CLIENT_ID"
LINKEDIN_CLIENT_SECRET = "YOUR_LINKEDIN_CLIENT_SECRET"
LINKEDIN_REDIRECT_URI = "http://localhost:5000/linkedin/callback" # Adjust as needed
LINKEDIN_AUTHORIZATION_BASE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_PROFILE_API_URL = "https://api.linkedin.com/v2/me"

@app.route('/linkedin/login')
def linkedin_login():
    linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=LINKEDIN_REDIRECT_URI, scope=['r_liteprofile', 'r_emailaddress']) # Adjust scopes as needed
    authorization_url, state = linkedin.authorization_url(LINKEDIN_AUTHORIZATION_BASE_URL)
    session['oauth_state'] = state
    return redirect(authorization_url)

@app.route('/linkedin/callback')
def linkedin_callback():
    linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, state=session['oauth_state'])
    token = linkedin.fetch_token(LINKEDIN_TOKEN_URL, client_secret=LINKEDIN_CLIENT_SECRET, authorization_response=request.url)
    linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, token=token)
    profile_data = linkedin.get(LINKEDIN_PROFILE_API_URL).json()
    #Process the profile data (e.g., save to database)
    return jsonify({"message": "LinkedIn login successful", "profile": profile_data}), 200


if __name__ == '__main__':
    app.secret_key = "YOUR_SECRET_KEY" # Set a secret key for sessions
    app.run(host='0.0.0.0', port=5000)