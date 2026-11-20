from typing import List
from fastapi import HTTPException
import os
import requests
from yandex_music import Client, Search, Suggestions
from yandex_music import OAuthToken
from yandex_music.track.track import Track

from config import SONGS_DIR
from mutagen.id3 import ID3, TIT2, TPE1
from mutagen.mp3 import MP3
from mutagen.id3 import APIC


TOKEN_FILE_PATH = "./ya_tok"


def save_token(token):
    """Сохраняет токен на диск, чтобы не логиниться при каждом перезапуске"""
    with open(TOKEN_FILE_PATH, "w", encoding="utf-8") as f:
        f.write(token.access_token + "\n" + token.refresh_token)


def load_refresh_token():
    """Читает refresh токен с диска"""
    if os.path.exists(TOKEN_FILE_PATH):
        with open(TOKEN_FILE_PATH, "r", encoding="utf-8") as f:
            f_lines = f.readlines()
        if f_lines and len(f_lines) > 1 and f_lines[1]:
            return f_lines[1].replace("\n", "")
    return None


def load_token():
    """Читает токен с диска"""
    if os.path.exists(TOKEN_FILE_PATH):
        with open(TOKEN_FILE_PATH, "r", encoding="utf-8") as f:
            f_lines = f.readlines()
        if f_lines and f_lines[0]:
            return f_lines[0].replace("\n", "")
    return None


def auth() -> OAuthToken:
    client = Client()
    token = client.device_auth(on_code=on_code)

    with open("./ya_tok", "w") as f:
        f.write(
            token.access_token
            + "\n"
            + token.refresh_token
            + "\n"
            + str(token.expires_in)
        )

    client.init()
    print(client.me.account.login)
    return token


def on_code(code):
    print(f"Open {code.verification_url} and enter user code {code.user_code}")


def ym_check_download(track_id):
    client = get_client()
    tracks = client.tracks([track_id])
    if not tracks:
        raise HTTPException(status_code=404, detail="Трек не найден")
    title = tracks[0].title
    artist = ", ".join(
        [a.name if a.name is not None else "Unknown" for a in tracks[0].artists]
    )
    file_path = f"{SONGS_DIR}/{artist}-{title}.mp3"
    if os.path.exists(file_path):
        return True
    else:
        return False


def ym_download(track_id):
    client = get_client()
    tracks = client.tracks([track_id])
    if not tracks:
        raise HTTPException(status_code=404, detail="Трек не найден")
    title = tracks[0].title
    artist = ", ".join(
        [a.name if a.name is not None else "Unknown" for a in tracks[0].artists]
    )
    cover_file = tracks[0].download_cover_bytes()

    file_path = f"{SONGS_DIR}/{artist}-{title}.mp3"

    tracks[0].download(file_path)
    try:
        try:
            audio = MP3(file_path, ID3=ID3)
        except Exception:
            audio = MP3(file_path)
            audio.add_tags()
        audio["TIT2"] = TIT2(encoding=3, text=title)
        audio["TPE1"] = TPE1(encoding=3, text=artist)
        if cover_file:
            mime_type = "image/jpeg"
            audio["APIC"] = APIC(
                encoding=3,  # 3 = UTF-8 strings
                mime=str(mime_type),
                type=3,  # 3 = Front cover photo
                desc="Front Cover",
                data=bytes(cover_file),
            )
        audio.save(v2_version=3)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update metadata: {str(e)}"
        )


def ym_getLink(track_id):
    client = get_client()
    tracks = client.tracks([track_id])
    if not tracks:
        raise HTTPException(status_code=404, detail="Трек не найден")
    return tracks[0].get_download_info()[0].get_direct_link()


def ym_search_s(query=""):
    client = get_client()
    _s: Suggestions | None = client.search_suggest(query)
    return _s.suggestions if _s else []


def ym_search_by_artist(artist: str, query=""):
    client = get_client()
    __q = client.artists_tracks(artist)
    if not __q:
        raise HTTPException(status_code=500)
    _tracks: List[Track] | None = __q.tracks
    if not _tracks:
        raise HTTPException(status_code=500)
    tr = [
        {
            "type": "track",
            "video_id": t.track_id,
            "cover_url": f"https://{t.cover_uri.replace('%%', '400x400')}"
            if t.cover_uri
            else "",
            "artist": ", ".join(
                [a.name if a.name is not None else "Unknown" for a in t.artists]
            ),
            "title": t.title,
            "duration": round(t.duration_ms / 1000) if t.duration_ms else 0,
            "stream_url": "yandex",
        }
        for t in _tracks
    ]
    return tr


def ym_search(query=""):
    client = get_client()
    _search: Search | None = client.search(text=query, type_="all", page=0)
    if _search is None:
        raise HTTPException(status_code=500, detail="failed to search")
    artists = []
    if _search.artists and _search.artists.results:
        tr = [
            {
                "type": "artist",
                "id": t.id,
                "cover_url": f"{t.get_og_image_url()}" if t.og_image else "",
                "title": t.name,
                "stream_url": "artist",
            }
            for t in _search.artists.results
        ]
        artists = tr[0:30]
    tracks = []
    if _search.tracks and _search.tracks.results:
        tr = [
            {
                "type": "track",
                "video_id": t.track_id,
                "cover_url": f"https://{t.cover_uri.replace('%%', '400x400')}"
                if t.cover_uri
                else "",
                "artist": ", ".join(
                    [a.name if a.name is not None else "Unknown" for a in t.artists]
                ),
                "title": t.title,
                "duration": round(t.duration_ms / 1000) if t.duration_ms else 0,
                "stream_url": "yandex",
            }
            for t in _search.tracks.results
        ]
        tracks = tr[0:30]
    return {"artists": artists, "tracks": tracks}


def get_client():
    return get_valid_client()


def get_yandex_client_credentials():
    """Извлекает встроенные client_id и client_secret из библиотеки yandex_music"""
    temp_client = Client()
    # В библиотеке они хранятся в приватных атрибутах или константах запроса
    client_id = getattr(temp_client, "_client_id", "23cabbbdc6cd418abb4b39c32c41195d")
    client_secret = getattr(
        temp_client, "_client_secret", "53bc75238f0c4d08a118e51fe9203300"
    )
    return client_id, client_secret


def refresh_access_token(refresh_token: str) -> str | None:
    """Отправляет запрос на продление токена в Яндекс OAuth"""
    if not refresh_token:
        return None

    client_id, client_secret = get_yandex_client_credentials()
    url = "https://yandex.ru"

    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    try:
        response = requests.post(url, data=data, timeout=10)
        if response.status_code == 200:
            new_data = response.json()
            new_access = new_data.get("access_token")
            # Яндекс может выдать новый refresh_token, если нет — оставляем старый
            new_refresh = new_data.get("refresh_token", refresh_token)

            if new_access:
                save_token(
                    OAuthToken(
                        access_token=new_access,
                        refresh_token=new_refresh,
                        expires_in=123,
                    )
                )
                print("Токен Яндекс Музыки успешно продлен!")
                return new_access
    except Exception as e:
        print(f"Ошибка при попытке продлить токен: {e}")

    return None


def get_valid_client() -> Client:
    """
    Универсальная функция для получения рабочего клиента.
    Сама продлит токен, если старый истек.
    """
    access_token = load_token()
    refresh_token = load_refresh_token()

    if not access_token:
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    # 1. Пробуем инициализировать с текущим токеном
    try:
        client = Client(access_token).init()
        if client.me and client.me.account:
            return client
    except Exception:
        print("Access token устарел, пробуем продлить через refresh_token...")

    # 2. Если упало — продлеваем токен
    new_access_token = refresh_access_token(refresh_token if refresh_token else "")
    if new_access_token:
        try:
            return Client(new_access_token).init()
        except Exception:
            pass

    # 3. Если и продление не сработало (например, пользователь отозвал доступ)
    raise HTTPException(status_code=401, detail="Сессия истекла, войдите заново")
