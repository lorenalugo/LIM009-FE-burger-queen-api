module.exports.default = (req) => {
  const {
    name, price, image, type,
  } = req.body;
  const obj = {};
  if (name && typeof (name) === 'string') {
    obj.name = name;
  }
  if (price && /\d+/.test(price)) {
    obj.price = price;
  }
  if (image && typeof (image) === 'string') {
    obj.image = image;
  }
  if (type && typeof (type) === 'string') {
    obj.type = type;
  }
  return obj;
};
