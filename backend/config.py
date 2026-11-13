from pathlib import Path

DATA_DIR = Path.home() / ".local" / "share" / "music-app" if False else Path(".")
SONGS_DIR = DATA_DIR / "songs_library"
