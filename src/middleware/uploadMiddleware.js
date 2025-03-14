import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型。只允许 JPG, PNG, GIF 和 WebP 格式。'), false);
    }
};

// 创建multer实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 限制5MB
    }
});

// 导出单个文件上传中间件，用于处理封面上传
export const uploadCover = upload.single('cover');

// 导出头像上传中间件
export const uploadAvatar = upload.single('avatar');

// 错误处理中间件
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer错误
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: '文件大小不能超过5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: `上传错误: ${err.message}`
        });
    } else if (err) {
        // 其他错误
        return res.status(400).json({
            success: false,
            message: err.message || '文件上传失败'
        });
    }
    next();
};

export default upload; 