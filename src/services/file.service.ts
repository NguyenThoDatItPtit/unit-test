import fs from "fs";
import path from "path";

export interface ImageInfo {
    filename: string;
}

export class FileService {
    private static outputDir = path.join(__dirname, "../../data/outputs");
    private static mediaDir = path.join(__dirname, "../../data/outputs/media");

    // ===== JSON =====
    static getJsonFilesList(): string[] {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        return fs.readdirSync(this.outputDir).filter(f => f.endsWith(".json"));
    }

    static getJsonById(filename: string): any {
        const filePath = path.join(this.outputDir, filename);

        if (!fs.existsSync(filePath)) {
            throw new Error("FILE_NOT_FOUND");
        }

        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    // ===== IMAGE METADATA =====
    static getImagesInfo(filenames: string[]): ImageInfo[] {
        if (!fs.existsSync(this.mediaDir)) {
            throw new Error("MEDIA_DIR_NOT_FOUND");
        }

        return filenames
            .filter(name => fs.existsSync(path.join(this.mediaDir, name)))
            .map(filename => ({ filename }));
    }

    // ===== IMAGE STREAM =====
    static getImageStream(filename: string) {
        const filePath = path.join(this.mediaDir, filename);

        if (!fs.existsSync(filePath)) {
            throw new Error("IMAGE_NOT_FOUND");
        }

        return {
            stream: fs.createReadStream(filePath),
            mime: this.getMime(filename),
        };
    }

    private static getMime(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        if (ext === ".png") return "image/png";
        if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
        if (ext === ".gif") return "image/gif";
        if (ext === ".webp") return "image/webp";
        return "application/octet-stream";
    }
}
