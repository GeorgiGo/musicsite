from sqlmodel import col, delete, select, Session
from db import engine, Song
import urllib
from mutagen import File
from mutagen.id3 import ID3
from pathlib import Path
import unicodedata
import base64


def _get_song_info(file_path):
    audio = File(file_path, easy=True)
    dur = audio.info.length
    title = " ".join(audio.get("title", ["Неизвестно"]))
    artist = "".join(audio.get("artist", ["Неизвестно"]))
    audio_full = ID3(file_path)
    cover_data = ""
    for tag in audio_full.values():
        if tag.FrameID == "APIC":  # Ищем кадр с картинкой (Attached Picture)
            image_data = tag.data
            image_mime = tag.mime  # Например, 'image/jpeg' или 'image/png'
            cover_data = f"data:{image_mime};base64,{base64.b64encode(image_data).decode('utf-8')}"
    encoded_id = base64.urlsafe_b64encode(file_path.name.encode("utf-8"))
    return {
        "stream_url": f"/songs_library/{urllib.parse.quote(unicodedata.normalize('NFC', file_path.name))}",
        "title": title,
        "artist": artist,
        "duration": round(dur),
        "cover_url": cover_data,
        "video_id": encoded_id.rstrip(b"=").decode("utf-8"),
    }


def _sync_songs():
    all_songs = [
        _get_song_info(song_path)
        for song_path in Path("./songs_library/").rglob("*")
        if song_path.is_file()
    ]
    with Session(engine) as session:
        existing_songs = session.exec(
            select(Song).where(
                col(Song.stream_url).in_([song["stream_url"] for song in all_songs])
            )
        ).all()
        db_song_map = {song.stream_url: song for song in existing_songs}
        for song in all_songs:
            if song["stream_url"] in db_song_map:
                db_song = db_song_map[song["stream_url"]]
                db_song.title = song["title"]
                db_song.artist = song["artist"]
                db_song.cover_url = song["cover_url"]
            else:
                db_song = Song.model_validate(song)
            session.add(db_song)
        session.exec(
            delete(Song).where(
                col(Song.stream_url).notin_([song["stream_url"] for song in all_songs])
            )
        )
        session.commit()
