const multer = require('multer');
const fs = require('fs-extra');
const { csv, txt } = require('../Types');
const rootDir = 'server/uploads/items';
let filename = null;
// const { createDir } = require('../Methods');

const createDestination = (req, file, cb) => {
    try {
        const id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
        filename = file.fieldname + '-' + Date.now() + id;

        fs.mkdir(`${rootDir}/${filename}`, { recursive: false }, (err) => {
            if (err) {
                console.log('mkdir-CreateDist: ', [err.message]);
                throw err;
            }
        });

        cb(null, `${rootDir}/${filename}`);
    } catch (err) {
        console.log('THIS ERR: ', [err.message]);
    }
};

const storageConfig = multer.diskStorage({
    destination: createDestination,
    filename: (req, file, cb) => {
        cb(null, filename + '.' + file.originalname.split('.').pop());
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === csv || file.mimetype === txt) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({ storage: storageConfig, fileFilter: fileFilter });

module.exports = upload;
