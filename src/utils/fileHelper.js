// ===== src/utils/fileHelper.js =====
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');

const deleteFile = async (filePath) => {
    try {
        if (!filePath) return;

        // Remove leading slash if present
        const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const fullPath = path.join('public', cleanPath);

        await fs.unlink(fullPath);
        logger.info(`File deleted: ${fullPath}`);
    } catch (error) {
        logger.error(`Error deleting file: ${filePath}`, error);
        // Don't throw error if file doesn't exist
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
};

const deleteMultipleFiles = async (filePaths) => {
    const deletePromises = filePaths.map(filePath => deleteFile(filePath));
    await Promise.all(deletePromises);
};

const moveFile = async (sourcePath, destinationPath) => {
    try {
        const sourceFullPath = path.join('public', sourcePath);
        const destFullPath = path.join('public', destinationPath);

        // Ensure destination directory exists
        const destDir = path.dirname(destFullPath);
        await fs.mkdir(destDir, { recursive: true });

        // Move file
        await fs.rename(sourceFullPath, destFullPath);
        logger.info(`File moved from ${sourcePath} to ${destinationPath}`);

        return destinationPath;
    } catch (error) {
        logger.error(`Error moving file: ${sourcePath}`, error);
        throw error;
    }
};

const getFileSize = async (filePath) => {
    try {
        const fullPath = path.join('public', filePath);
        const stats = await fs.stat(fullPath);
        return stats.size;
    } catch (error) {
        logger.error(`Error getting file size: ${filePath}`, error);
        throw error;
    }
};

module.exports = {
    deleteFile,
    deleteMultipleFiles,
    moveFile,
    getFileSize
};
