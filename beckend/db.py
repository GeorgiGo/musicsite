from typing import Annotated, List, Optional
from fastapi import Depends
from sqlmodel import (
    Field,
    Relationship,
    Session,
    SQLModel,
    create_engine,
)

sqlite_url = "sqlite:///saved_songs.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


class SongBase(SQLModel):
    video_id: str = Field()
    artist: str = Field()
    title: str = Field()
    cover_url: str = Field()
    stream_url: str = Field()
    duration: int = Field()


class SongCreate(SongBase):
    pass


class SongUpdate(SongBase):
    video_id: str | None = None
    artist: str | None = None
    title: str | None = None
    cover_url: str | None = None
    stream_url: str | None = None
    duration: int | None = None


class PlaylistBase(SQLModel):
    name: str = Field()
    additional_data: str = Field()


class PlaylistUpdate(PlaylistBase):
    name: str | None = None
    additional_data: str | None = None


class PlaylistCommon(PlaylistBase):
    pass


class PlaylistSongLink(SQLModel, table=True):
    playlist_id: Optional[int] = Field(
        default=None, foreign_key="playlist.id", primary_key=True
    )
    song_id: Optional[str] = Field(
        default=None, foreign_key="song.video_id", primary_key=True
    )


class Playlist(PlaylistBase, table=True):
    id: int | None = Field(default=None, primary_key=True, index=True)
    songs: List["Song"] = Relationship(
        back_populates="playlist", link_model=PlaylistSongLink
    )


class Song(SongBase, table=True):
    id: int | None = Field(default=None, primary_key=True, index=True)
    playlist: List[Playlist] = Relationship(
        back_populates="songs", link_model=PlaylistSongLink
    )


class SongPublic(SongBase):
    id: int


class PlaylistFull(PlaylistBase):
    id: int
    songs: List[SongPublic] = []


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


def create_all():
    SQLModel.metadata.create_all(engine)
