import shutil
from typing import List, Optional
import urllib
import urllib.parse
from sqlalchemy.orm import joinedload
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from db import (
    PlaylistFull,
    PlaylistUpdate,
    Song,
    SongCreate,
    SongUpdate,
    SessionDep,
    create_all,
    PlaylistCommon,
    Playlist,
)
import os
from fastapi.staticfiles import StaticFiles

import urllib
from mutagen.id3 import ID3, TIT2, TPE1
from mutagen.mp3 import MP3
from mutagen.id3 import APIC, error
from pathlib import Path

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_all()


app.mount(
    "/songs_library",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "songs_library")),
    name="static",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/song", response_model=Song)
def create_song(song: SongCreate, session: SessionDep):
    db_song = Song.validate(song)
    session.add(db_song)
    session.commit()
    session.refresh(db_song)
    return db_song


@app.head("/songs/{video_id}")
async def is_song(video_id: str, session: SessionDep):
    song = session.exec(select(Song).where(Song.video_id == video_id)).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@app.get("/songs")
def get_all_songs(session: SessionDep):
    return session.exec(select(Song)).all()


@app.get("/songs/{song_id}")
def get_song(song_id: str, session: SessionDep):
    song = session.exec(select(Song).where(Song.video_id == song_id)).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@app.post("/songs/new", response_model=None)
async def add_song_files(songs: list[UploadFile] = File(...)):
    for song in songs:
        name: str = song.filename
        if name.endswith(".mp3") and not os.path.exists(f"./songs_library/{name}"):
            with open(f"./songs_library/{name}", "wb") as b:
                shutil.copyfileobj(song.file, b)
    return {"message": "saved"}


@app.patch("/songs/{song_id}", response_model=Song)
async def update_song(
    song_id: str,
    session: SessionDep,
    title: str = Form(...),
    artist: str = Form(...),
    cover_file: Optional[UploadFile] = File(None),
):
    song_db = session.exec(select(Song).where(Song.video_id == song_id)).first()
    if not song_db:
        raise HTTPException(status_code=404, detail="Song not found")
    file_path = "." + urllib.parse.unquote(song_db.stream_url)
    try:
        try:
            audio = MP3(file_path, ID3=ID3)
        except error:
            # If the file lacks an ID3 tag entirely, initialize it
            audio = MP3(file_path)
            audio.add_tags()
        audio["TIT2"] = TIT2(encoding=3, text=title)
        audio["TPE1"] = TPE1(encoding=3, text=artist)
        if cover_file:
            img_data = await cover_file.read()
            mime_type = cover_file.content_type or "image/jpeg"
            audio["APIC"] = APIC(
                encoding=3,  # 3 = UTF-8 strings
                mime=str(mime_type),  # 'image/jpeg' or 'image/png'
                type=3,  # 3 = Front cover photo
                desc="Front Cover",
                data=bytes(img_data),  # Binary data of the image
            )
        # Save the modifications.
        # v2_version=3 ensures compatОт винта (Dance Remix)ibility across standard players like Windows Media Player/iTunes
        audio.save(v2_version=3)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update metadata: {str(e)}"
        )
    from get_local_songs import _get_song_info

    song_data = SongUpdate.model_validate(_get_song_info(Path(file_path)))
    song_db.sqlmodel_update(song_data)
    session.add(song_db)
    session.commit()
    session.refresh(song_db)
    return song_db


@app.delete("/songs/{video_id}")
def delete_song(video_id: str, session: SessionDep):
    song = session.exec(select(Song).where(Song.video_id == video_id)).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    session.delete(song)
    session.commit()
    return song


@app.delete("/songs/id/{song_id}")
def delete_song_id(song_id: int, session: SessionDep):
    song = session.get(Song, song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    session.delete(song)
    session.commit()
    return song


@app.get("/playlists", response_model=List[PlaylistFull])
def get_all_playlists(session: SessionDep):
    return (
        session.exec(select(Playlist).options(joinedload(Playlist.songs)))
        .unique()
        .all()
    )


@app.post("/playlist", response_model=Playlist)
def create_playlist(playlist: PlaylistCommon, session: SessionDep):
    db_playlist = Playlist.validate(playlist)
    session.add(db_playlist)
    session.commit()
    session.refresh(db_playlist)
    return db_playlist


@app.patch("/playlists/{playlist_id}", response_model=Playlist)
def change_playlist(playlist_id: int, playlist: PlaylistUpdate, session: SessionDep):
    db_playlist = session.get(Playlist, playlist_id)
    if not db_playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    db_data = playlist.model_dump(exclude_unset=True)
    db_playlist.sqlmodel_update(db_data)
    session.add(db_playlist)
    session.commit()
    session.refresh(db_playlist)
    return db_playlist


@app.delete("/playlists/{playlist_id}", response_model=Playlist)
def delete_playlist(playlist_id: int, session: SessionDep):
    playlist = session.get(Playlist, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    session.delete(playlist)
    session.commit()
    return playlist


@app.post("/playlists/{playlist_id}/add_song/{song_id}")
def add_song_to_playlist(playlist_id: int, song_id: str, session: SessionDep):
    song = session.exec(select(Song).where(Song.video_id == song_id)).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    playlist = session.get(Playlist, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    playlist.songs.append(song)
    session.commit()
    session.refresh(playlist)
    return playlist


@app.delete("/playlists/{playlist_id}/remove_song/{song_id}")
def delete_song_from_playlist(playlist_id: int, song_id: str, session: SessionDep):
    song = session.exec(select(Song).where(Song.video_id == song_id)).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    playlist = session.get(Playlist, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    playlist.songs.remove(song)
    session.commit()
    session.refresh(playlist)
    return playlist


@app.get("/update")
def update_songs():
    from get_local_songs import _sync_songs

    _sync_songs()


from sqlmodel import Session, select, or_, and_, func


@app.get("/search_local")
def search_local(session: SessionDep, search: str = ""):
    return session.exec(select(Song)).all()
