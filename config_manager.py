
from cryptography.fernet import Fernet
import os
import json
import base64

class ConfigManager:
    def __init__(self, secrets_file='secrets.yaml'):
        self.secrets_file = secrets_file

    def load_secrets(self):
        try:
            with open(self.secrets_file, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading secrets: {e}")
            return None
