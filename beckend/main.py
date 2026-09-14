from ytmusicapi import YTMusic
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

ydl_opts = {
    "format": "bestaudio/best",
    "noplaylist": True,
    "quiet": True,
    # --- ИСПРАВЛЕНИЕ ДЛЯ СКОРОСТИ И НАПОЛНЕНИЯ СПИСКА ---
    "playlist_items": "1-5",  # Жестко запрашиваем только первые 5 результатов
    "lazy_playlist": True,  # Не парсим страницы дальше этого лимита
    "skip_download": True,
    "extractor_args": {
        "youtube": {
            "player_client": ["ios", "android"],  # Обход блокировок ТСПУ
            "skip": ["dash", "hls"],
        }
    },
}


def _sync_yt_search(search_query: str):
    # Добавляем принудительный маркер ://youtube.com, чтобы отсечь мультики
    full_query = f"ytsearch5:{search_query}&sp=EgIQAQ%253D%253D"

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(full_query, download=False)
        all_tracks = []
        if "entries" in info and info["entries"]:
            for video_data in info["entries"]:
                if not video_data:
                    continue
                all_tracks.append(
                    {
                        "title": video_data.get("title"),
                        "url": video_data.get("url"),
                        "duration": video_data.get("duration"),
                        "thumbnail": video_data.get("thumbnail"),
                        "id": video_data.get("id"),
                    }
                )
        return all_tracks


async def get_yt_music_stream_async(search_query: str):
    try:
        # Эта магия запускает синхронный yt-dlp в отдельном потоке,
        # не блокируя ваш основной асинхронный сервер (FastAPI/Sanic)
        return await asyncio.to_thread(_sync_yt_search, search_query)
    except Exception as e:
        print(f"Ошибка при асинхронном поиске: {e}")
        return []


yt = YTMusic()


def extract_minimal_info(video_data):
    if not video_data:
        return None

    # 1. Поиск идеальной квадратной обложки (YouTube Music)
    square_thumbs = [
        t for t in video_data.get("thumbnails", []) if t.get("width") == t.get("height")
    ]
    if square_thumbs:
        # Сортируем по ширине и берем максимальное разрешение (обычно 544x544)
        album_art = max(square_thumbs, key=lambda x: x.get("width", 0)).get("url")
    else:
        # Резервный вариант, если квадрата нет
        album_art = video_data.get("thumbnail")

    # 2. Формируем компактный и легкий словарь
    minimal_track = {
        "id": video_data.get("id"),
        "title": video_data.get("title"),  # Название трека
        "artist": video_data.get("artist"),  # Исполнитель
        "album": video_data.get("album"),  # Название альбома (если есть)
        "duration": video_data.get("duration"),  # Длительность в секундах
        "cover_url": album_art,  # Наша квадратная обложка
        "stream_url": video_data.get("url"),  # Прямая ссылка на аудиопоток
    }

    return minimal_track


def _get_single_track(video_id: str):
    url = f"https://music.youtube.com/watch?v={video_id}"
    with yt_dlp.YoutubeDL(
        {
            "format": "bestaudio/best",
            "quiet": True,
            "extractor_args": {
                "youtube": {
                    "player_client": ["ios", "android"],
                    "skip": ["dash", "hls"],
                }
            },
        }
    ) as ydl:
        try:
            video_data = ydl.extract_info(url, download=False)
            if not video_data:
                return None
            # Поиск квадратной обложки 1:1
            square_thumbs = [
                t
                for t in video_data.get("thumbnails", [])
                if t.get("width") == t.get("height")
            ]
            album_art = (
                max(square_thumbs, key=lambda x: x.get("width", 0)).get("url")
                if square_thumbs
                else video_data.get("thumbnail")
            )
            # Собираем минимальный чистый JSON
            return {
                "id": video_data.get("id"),
                "title": video_data.get("title"),
                "artist": video_data.get("uploader") or video_data.get("artist"),
                "duration": video_data.get("duration"),
                "cover_url": album_art,
                "stream_url": video_data.get("url"),
            }
        except Exception as e:
            print(f"[ERROR] Ошибка парсинга трека {video_id}: {e}")
            return None


async def get_songs(search_query: str):
    search_results = yt.search(search_query, filter="songs")
    # Создаем список асинхронных задач для каждого найденного трека
    tasks = [
        asyncio.to_thread(_get_single_track, search["videoId"])
        for search in search_results
        if search.get("videoId")
    ]
    # Запускаем ВСЕ задачи параллельно
    results = await asyncio.gather(*tasks)
    # Отфильтровываем треки, которые завершились ошибкой (None)
    cleaned_songs = [song for song in results if song is not None]

    return cleaned_songs
    # with yt_dlp.YoutubeDL(
    #    {
    #        "format": "bestaudio/best",
    #        "quiet": True,
    #        "extractor_args": {
    #            "youtube": {
    #                "player_client": ["ios", "android"],
    #                "skip": ["dash", "hls"],
    #            }
    #        },
    #    }
    # ) as ydl:
    #    songs_info = []
    #    for search in yt.search(search_query, filter="songs"):
    #        raw_info = ydl.extract_info(
    #            f"https://music.youtube.com/watch?v={search['videoId']}",
    #            download=False,
    #        )
    #        songs_info.append(extract_minimal_info(raw_info))

    #    return songs_info


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.0:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/suggetions/")
async def suggetions(search: str = ""):
    print(search)
    suggetions = yt.get_search_suggestions(search)
    return suggetions


@app.get("/search")
async def root(search: str):
    return await get_songs(search)
    # return await get_yt_music_stream_async(search)
