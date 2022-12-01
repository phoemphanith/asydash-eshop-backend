const multer = require("multer");
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.replace(" ", "-").split(".")[0];
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

const getFilePath = (file) => {
  if (file) {
    return `${process.env.APP_HOST}/public/uploads/${file.filename}`;
  }

  return "";
};

exports.UploadOption = multer({ storage: storage });
exports.GetFilePath = getFilePath;
