const paginate = (data, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    pagination: {
      total: totalItems,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: totalPages,
    }
  };
};

module.exports = paginate;
