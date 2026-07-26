const crypto = require("crypto");
const fs = require("fs");
const { pipeline } = require("stream");

const ALGO = "aes-256-gcm"; 

/* ================= KEY ================= */
function generateKey() {
    return crypto.randomBytes(32); // AES-256
}

/* ================= ENCRYPT ================= */
function encryptFile(inputPath, outputPath, key) {
    return new Promise((resolve, reject) => {
        try {
            if (!Buffer.isBuffer(key) || key.length !== 32) {
                return reject("Invalid key (must be 32 bytes)");
            }

            const iv = crypto.randomBytes(12); 

            const cipher = crypto.createCipheriv(ALGO, key, iv);

            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream(outputPath);

            pipeline(input, cipher, output, (err) => {
                if (err) {
                    return reject("Encryption failed");
                }

                try {
                    const authTag = cipher.getAuthTag();

                    resolve({
                        fileIV: iv.toString("hex"),
                        authTag: authTag.toString("hex")
                    });
                } catch (e) {
                    reject("Encryption finalization failed");
                }
            });

        } catch (err) {
            reject("Encryption error");
        }
    });
}

/* ================= DECRYPT ================= */
function decryptFile(inputPath, outputPath, key, fileIV, authTag) {
    return new Promise((resolve, reject) => {
        try {
            if (!Buffer.isBuffer(key) || key.length !== 32) {
                return reject("Invalid key");
            }

            const iv = Buffer.from(fileIV, "hex");
            const tag = Buffer.from(authTag, "hex");

            if (iv.length !== 12) {
                return reject("Invalid IV");
            }

            const decipher = crypto.createDecipheriv(ALGO, key, iv);
            decipher.setAuthTag(tag);

            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream(outputPath);

            pipeline(input, decipher, output, (err) => {
                if (err) {
                    return reject("Decryption failed or data tampered");
                }
                resolve();
            });

        } catch (err) {
            reject("Decryption error");
        }
    });
}

/* ================= HASH (STREAM SAFE) ================= */
function generateHash(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject("File not found");
        }

        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (data) => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", () => reject("Hashing failed"));
    });
}

/* ================= EXPORT ================= */
module.exports = {
    generateKey,
    encryptFile,
    decryptFile,
    generateHash
};