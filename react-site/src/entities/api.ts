import type { Playlist, Song } from "./dataInterfaces";

const BASE_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return response.json()
}

export const MusicAPI = {
    async addSongFiles(form: FormData): Promise<void> {
        const response = await fetch(`${BASE_URL}/songs/new`, { method: 'POST', body: form })
        if (!response.ok) throw new Error('Failed to add files')
    },
    async searchLocalSongs(searchQuery: string): Promise<Song[]> {
        const params = new URLSearchParams({ search: searchQuery });
        const response = await fetch(`${BASE_URL}/search_local/?${params.toString()}`)
        return handleResponse<Song[]>(response);
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
    }
}
