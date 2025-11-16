const multer = require('multer');
const path = require('path');

// Storage configuration for ID cards (persistent)
const idCardStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/id-cards/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'id-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage configuration for selfies (temporary - 30 days TTL)
const selfieStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/selfies/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'selfie-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
    }
};

// Middleware for ID card upload
const uploadIdCard = multer({
    storage: idCardStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFilter
}).single('idCard');

// Middleware for selfie upload
const uploadSelfie = multer({
    storage: selfieStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFilter
}).single('selfie');

// Middleware for payment proof upload
const uploadPaymentProof = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/payment-proofs/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFilter
}).single('paymentProof');

module.exports = {
    uploadIdCard,
    uploadSelfie,
    uploadPaymentProof
};
