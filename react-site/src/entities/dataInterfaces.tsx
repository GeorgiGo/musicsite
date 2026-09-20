export interface SongInformation {
    id: number;
    video_id: string;
    stream_url: string;
    baseSongInformation: BaseSongInformation
}
export interface SongEditInformation {
    video_id: string;
    title: string;
    artist: string;
    cover_file;
}
export interface BaseSongInformation {
    title: string;
    artist: string;
    duration: number;
    cover_url: string;
}
export interface SongElementInformation extends SongInformation {
    setCurSong: () => void;
    updatePlaylists: () => void;
}
export interface Playlist {
    id: number;
    name: string;
    additional_data: string;
    songs: [];
}
