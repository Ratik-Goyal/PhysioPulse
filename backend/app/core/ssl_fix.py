import ssl
import os

# Disable SSL verification globally for development
if os.getenv('DISABLE_SSL', 'false').lower() == 'true':
    ssl._create_default_https_context = ssl._create_unverified_context