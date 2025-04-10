
from cryptography.fernet import Fernet
import os
import json
import base64

class ConfigManager:
    def __init__(self, config_file='local_config.enc'):
        self.config_file = config_file
        self.key = self._get_or_create_key()
        self.fernet = Fernet(self.key)

    def _get_or_create_key(self):
        key_file = '.config.key'
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            return key

    def save_credentials(self, credentials):
        encrypted_data = self.fernet.encrypt(json.dumps(credentials).encode())
        with open(self.config_file, 'wb') as f:
            f.write(encrypted_data)

    def load_credentials(self):
        if not os.path.exists(self.config_file):
            return None
        with open(self.config_file, 'rb') as f:
            encrypted_data = f.read()
        decrypted_data = self.fernet.decrypt(encrypted_data)
        return json.loads(decrypted_data)
