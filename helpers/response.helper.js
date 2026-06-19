exports.successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

exports.paginatedResponse = (res, message, data, total, page, totalPages, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      total,
      page,
      totalPages
    }
  });
};
