pyinstaller --onefile --name backend-x86_64-unknown-linux-gnu main.py
cp ./dist/backend-x86_64-unknown-linux-gnu ../frontend/src-tauri/binaries/backend-x86_64-unknown-linux-gnu
