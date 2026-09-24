import type { RefObject } from "react";

export interface SongEditInformation {
    video_id: string;
    title: string;
    artist: string;
    cover_file: string;
}

export interface Playlist {
    id: number;
    name: string;
    additional_data: string;
    songs: Song[];
}
/** An interface for `SearchDropdown` component's parametrs */
export interface SearchDropdownProps {
    dropdownData: string[],
    searchFunc: () => void,
    setValue: (s: string) => void,
    search: string,
    inputElRef: RefObject<HTMLInputElement>
}
export interface BaseSong {
    title: string;
    artist: string;
    duration: number;
    cover_url: string;
}
/** An interface, that describes a song*/
export interface Song extends BaseSong {
    id: number;
    video_id: string;
    stream_url: string;
}
export interface SongElement extends Song {
    isPlaying: boolean
    setCurSong: () => void;
}
