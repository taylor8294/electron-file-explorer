export class FileElement {
    id?: string;
    name: string;
    dir: string;
    path?: string;
    parent?: FileElement;
    size?: number;
    mtime?: number;
    birthtime?: number;
    atime?: number;
    perm?: string;
    isFile: boolean;
    isDir: boolean;
    isSymLink?: boolean;
    isSocket?: boolean;
    IsFIFO?: boolean;
    ext?: string;
    mime?: string | boolean;
}