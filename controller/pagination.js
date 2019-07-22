
module.exports = (collection, count, page, limit) => {
  const totalPages = Math.ceil(count / limit) || 1;
  const nextObj = `/${collection}?limit=${limit || count}&page=${(page + 1) >= totalPages ? totalPages : (page + 1)}`;
  const lastObj = `/${collection}?limit=${limit || count}&page=${totalPages}`;
  const firstObj = `/${collection}?limit=${limit || count}&page=${page > 1 ? 1 : page}`;
  const prevObj = `/${collection}?limit=${limit || count}&page=${(page - 1) !== 0 ? page - 1 : page}`;
  return { link: `<${firstObj}>; rel="first", <${prevObj}>; rel="prev", <${nextObj}>; rel="next", <${lastObj}>; rel="last"` };
};
