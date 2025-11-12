import os
import zipfile

BASE_DIR = os.path.join("deploy", "ksp-hub-github-io-root")
DEST_PATH = os.path.join("archives", "ksp-hub-github-io-root.zip")

os.makedirs("archives", exist_ok=True)

with zipfile.ZipFile(DEST_PATH, "w", zipfile.ZIP_DEFLATED) as archive:
    for root, _, files in os.walk(BASE_DIR):
        for filename in files:
            file_path = os.path.join(root, filename)
            arcname = os.path.relpath(file_path, BASE_DIR)
            archive.write(file_path, arcname)

