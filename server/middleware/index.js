const { protect, authorize, optionalAuth } = require('./auth');
const { errorHandler, asyncHandler } = require('./error');
const { uploadSingle, uploadMultiple, handleUploadError } = require('./upload');

module.exports = {
  protect,
  authorize,
  optionalAuth,
  errorHandler,
  asyncHandler,
  uploadSingle,
  uploadMultiple,
  handleUploadError
};
