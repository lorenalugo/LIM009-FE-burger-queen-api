/* eslint-disable prefer-destructuring */
const _ = require('lodash');

const {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} = require('../../controller/products');

jest.mock('../../libs/connection');

const db = require('../../libs/connection');

describe('createProduct', () => {
  beforeAll(async () => {
    await db();
  });

  afterAll(async () => {
    await db().close();
  });

  it('should insert a product into products collection', async () => {
    const mockReq = {
      headers: '',
      body: {
        name: 'test product',
        price: '5',
        image: 'image.jpg',
        type: 'dinner',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq, mockResp, mockNext);

    expect(_.omit(mockResp.send.mock.calls[0][0], '_id')).toEqual({
      name: 'test product',
      price: '5',
      image: 'image.jpg',
      type: 'dinner',
    });

    expect(mockNext.mock.calls).toHaveLength(1);
    expect(mockNext.mock.calls[0][0]).toBe(undefined);
    expect(mockResp.send.mock.calls).toHaveLength(1);
  });

  it('should return 400 when missing price', async () => {
    const mockReq = {
      headers: '',
      body: {
        name: 'another test product',
        image: 'image.jpg',
        type: 'dinner',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq, mockResp, mockNext);
    expect(mockNext.mock.calls).toHaveLength(0);
    expect(mockResp.send.mock.calls).toHaveLength(0);
    expect(mockResp.sendStatus.mock.calls).toHaveLength(1);
    expect(mockResp.sendStatus.mock.calls[0][0]).toEqual(400);
  });

  it('should return 400 when missing name', async () => {
    const mockReq = {
      headers: '',
      body: {
        price: 3,
        image: 'image.jpg',
        type: 'dinner',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq, mockResp, mockNext);
    expect(mockNext.mock.calls).toHaveLength(0);
    expect(mockResp.send.mock.calls).toHaveLength(0);
    expect(mockResp.sendStatus.mock.calls).toHaveLength(1);
    expect(mockResp.sendStatus.mock.calls[0][0]).toEqual(400);
  });
});

describe('getProducts', () => {
  beforeAll(async () => {
    await db();
    const mockReq1 = {
      headers: '',
      body: {
        name: 'new test product',
        price: '6',
        image: 'newimage.jpg',
        type: 'dinner',
      },
    };

    const mockReq2 = {
      headers: '',
      body: {
        name: 'another test product',
        price: '3',
        image: 'anotherimage.jpg',
        type: 'dinner',
      },
    };
    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq1, mockResp, mockNext);
    await createProduct(mockReq2, mockResp, mockNext);
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get products collection', (done) => {
    const mockReq = {
      headers: '',
      query: {
        limit: 1,
        page: 1,
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      set: jest.fn((prop, value) => value),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(mockResp.set.mock.calls[0][0]).toBe('link');
      expect(code).toEqual(undefined);
      done();
    };

    getProducts(mockReq, mockResp, mockNext);
  });

  it('should get users collection when missing page and limit query', (done) => {
    const mockReq = {
      headers: '',
      query: {},
    };

    const mockResp = {
      send: jest.fn(json => json),
      set: jest.fn((prop, value) => value),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(mockResp.set.mock.calls[0][0]).toBe('link');
      expect(code).toEqual(undefined);
      done();
    };

    getProducts(mockReq, mockResp, mockNext);
  });
});

describe('getProductById', () => {
  let mockId1 = '';

  beforeAll(async () => {
    await db();
    const mockReq1 = {
      headers: '',
      body: {
        name: 'new test product',
        price: '6',
        image: 'newimage.jpg',
        type: 'dinner',
      },
    };

    const mockReq2 = {
      headers: '',
      body: {
        name: 'another test product',
        price: '3',
        image: 'anotherimage.jpg',
        type: 'dinner',
      },
    };
    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq1, mockResp, mockNext);
    await createProduct(mockReq2, mockResp, mockNext);

    mockId1 = mockResp.send.mock.calls[0][0];
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get 404 when wrong id', (done) => {
    const mockReq = {
      headers: '',
      params: {
        productId: 'wrongId',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(404);
        done();
      },
    };

    const mockNext = jest.fn(code => code);

    getProductById(mockReq, mockResp, mockNext);
  });

  it('should get product by id', (done) => {
    const expected = {
      name: 'new test product',
      image: 'newimage.jpg',
      type: 'dinner',
    };

    const mockReq = {
      headers: '',
      params: {
        productId: mockId1._id.toString(),
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(mockResp.send.mock.calls[0][0]).toMatchObject(expected);
      expect(code).toEqual(undefined);
      done();
    };

    getProductById(mockReq, mockResp, mockNext);
  });
});

describe('deleteProductById', () => {
  let mockId1 = '';

  beforeAll(async () => {
    await db();
    const mockReq1 = {
      headers: '',
      body: {
        name: 'new test product',
        price: '6',
        image: 'newimage.jpg',
        type: 'dinner',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq1, mockResp, mockNext);

    mockId1 = mockResp.send.mock.calls[0][0];
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get 404 when wrong id', (done) => {
    const mockReq = {
      headers: '',
      params: {
        productId: 'wrongId',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(404);
        done();
      },
    };

    const mockNext = jest.fn(code => code);

    deleteProductById(mockReq, mockResp, mockNext);
  });

  it('should delete product by id', (done) => {
    const expected = {
      name: 'new test product',
      image: 'newimage.jpg',
      type: 'dinner',
    };

    const mockReq = {
      headers: '',
      params: {
        productId: mockId1._id.toString(),
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(mockResp.send.mock.calls[0][0]).toMatchObject(expected);
      expect(code).toEqual(undefined);
      done();
    };

    deleteProductById(mockReq, mockResp, mockNext);
  });
});

describe('updateProductById', () => {
  let mockId1 = '';

  beforeAll(async () => {
    await db();
    const mockReq1 = {
      headers: '',
      body: {
        name: 'product',
        price: '3',
        image: 'image.jpg',
        type: 'lunch',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createProduct(mockReq1, mockResp, mockNext);

    mockId1 = mockResp.send.mock.calls[0][0];
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get 404 when wrong id', (done) => {
    const mockReq = {
      headers: '',
      params: {
        productId: 'wrongId',
      },
      body: {
        name: 'product updated',
        price: '3',
        image: 'image.jpg',
        type: 'lunch',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(404);
        done();
      },
    };

    const mockNext = jest.fn(code => code);

    updateProductById(mockReq, mockResp, mockNext);
  });

  it('should update product by id', (done) => {
    const expected = {
      name: 'product updated',
      image: 'image.jpg',
      type: 'lunch',
    };

    const mockReq = {
      headers: '',
      params: {
        productId: mockId1._id.toString(),
      },
      body: {
        name: 'product updated',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(mockResp.send.mock.calls[0][0]).toMatchObject(expected);
      expect(code).toEqual(undefined);
      done();
    };

    updateProductById(mockReq, mockResp, mockNext);
  });

  it('should get 400 when missing props', (done) => {
    const mockReq = {
      headers: '',
      params: {
        productId: mockId1._id.toString(),
      },
      body: {},
    };

    const mockNext = jest.fn(code => code);

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(mockNext.mock.calls).toHaveLength(0);
        expect(code).toEqual(400);
        done();
      },
    };

    updateProductById(mockReq, mockResp, mockNext);
  });

  it('should get 404 when not found', (done) => {
    const mockReq = {
      headers: '',
      params: {
        productId: mockId1._id.toString(),
      },
      body: {},
    };

    const mockResp1 = {
      send: jest.fn(json => json),
    };

    const mockNext1 = jest.fn(code => code);

    deleteProductById(mockReq, mockResp1, mockNext1);

    const mockNext = jest.fn(code => code);

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(mockNext.mock.calls).toHaveLength(0);
        expect(code).toEqual(404);
        done();
      },
    };

    updateProductById(mockReq, mockResp, mockNext);
  });
});
