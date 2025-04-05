
from flask import Flask, request, jsonify
import yaml
from pathlib import Path
from main import create_and_run_bot

app = Flask(__name__)

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
        create_and_run_bot()
        return jsonify({"message": "Application started successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
