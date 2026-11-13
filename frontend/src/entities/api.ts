import type { Authorized } from "../App";
import type { Playlist, Song, songTimeStat } from "./dataInterfaces";

const BASE_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return response.json()
}

export const MusicAPI = {
    async checkDownloadedYandexSong(video_id: string): Promise<boolean> {
        const response = await fetch(`${BASE_URL}/yandex/check_download/${video_id}`)
        return handleResponse<boolean>(response)
    },
    async downloadYandexSong(video_id: string) {
        const response = await fetch(`${BASE_URL}/yandex/download/${video_id}`)
        handleResponse(response)
    },
    async checkYandexAuth() {
        const response = await fetch(`${BASE_URL}/yandex/auth/status`)
        return handleResponse<Authorized>(response);
    },
    async addSongFiles(form: FormData): Promise<void> {
        const response = await fetch(`${BASE_URL}/songs/new`, { method: 'POST', body: form })
        if (!response.ok) throw new Error('Failed to add files')
    },
    async searchYandexSong_s(searchQuery: string): Promise<string[]> {
        if (searchQuery == '') return []
        const params = new URLSearchParams({ query: searchQuery });
        const response = await fetch(`${BASE_URL}/yandex/search_s/?${params.toString()}`)
        return handleResponse<string[]>(response);
    },
    async searchYandexSongs(searchQuery: string): Promise<Song[]> {
        if (searchQuery == '') return []
        const params = new URLSearchParams({ query: searchQuery });
        const response = await fetch(`${BASE_URL}/yandex/search/?${params.toString()}`)
        return handleResponse<Song[]>(response);
    },
    async searchLocalSongs(searchQuery: string): Promise<Song[]> {
        const params = new URLSearchParams({ search: searchQuery });
        const response = await fetch(`${BASE_URL}/search_local/?${params.toString()}`)
        return handleResponse<Song[]>(response);
    },
    async patchSong(song_id: string, body: FormData): Promise<Response> {
        const response = await fetch(`${BASE_URL}/songs/${song_id}`, { method: 'PATCH', body: body });
        return response
    },
    async updateSongLibrary(): Promise<void> {
        const response = await fetch(`${BASE_URL}/update`);
        if (!response.ok) throw new Error('Failed to update library')
    },
    async getAllPlaylists(): Promise<Playlist[]> {
        const response = await fetch(`${BASE_URL}/playlists`);
        return handleResponse<Playlist[]>(response);
    },
    async createPlaylist(): Promise<Playlist> {
        const response = await fetch(`${BASE_URL}/playlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ name: "new playlist", additional_data: "" })
        });
        return handleResponse<Playlist>(response);
    },
    async changePlaylist(playlistId: number, newName: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/playlists/${playlistId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ name: newName })
        })
        if (!response.ok) throw new Error('Failed to change playlist')
    },
    async addSongToPlaylist(playlistId: number, songId: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/playlists/${playlistId}/add_song/${songId}`, { method: 'POST' })
        if (!response.ok) throw new Error('Failed to add song to playlist')
    },
    async removeSongFromPlaylist(playlistId: number, songId: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/playlists/${playlistId}/remove_song/${songId}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to add song to playlist')
    },
    async removePlayist(playlistId: number): Promise<void> {
        const response = await fetch(`${BASE_URL}/playlists/${playlistId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove playlist')
    },
    async getStat(): Promise<getStatReturn> {
        const response = await fetch(`${BASE_URL}/statistics`)
        return handleResponse<getStatReturn>(response)
    },
    async putStat(statistics): Promise<void> {
        const response = await fetch(`${BASE_URL}/statistics`, {
            method: 'PUT',
            body: JSON.stringify(statistics),
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            keepalive: true
        })
        if (!response.ok) throw new Error('Failed to update statistics')
    }
}
export interface getStatReturn {
    songTimeDate: string;
    all_minutes: string;
}
