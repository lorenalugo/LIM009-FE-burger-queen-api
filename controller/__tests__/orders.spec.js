const {
  // getOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
} = require('../../controller/orders');

const { createProduct } = require('../../controller/products');

jest.mock('../../libs/connection');

const db = require('../../libs/connection');

describe('createOrder', () => {
  let mockProductId = '';

  beforeAll(async () => {
    await db();
  });

  afterAll(async () => {
    await db().close();
  });

  it('should return 400 when missing userId', async () => {
    const mockReq1 = {
      headers: '',
      body: {
        name: 'test product',
        price: '5',
        image: 'image.jpg',
        type: 'dinner',
      },
    };

    const mockResp1 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext1 = jest.fn(code => code);

    await createProduct(mockReq1, mockResp1, mockNext1);

    mockProductId = mockResp1.send.mock.calls[0][0]._id;

    const mockReq = {
      body: {
        userId: '',
        client: '',
        products: [
          {
            product: mockProductId,
            qty: 2,
          },
        ],
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createOrder(mockReq, mockResp, mockNext);

    expect(mockNext.mock.calls).toHaveLength(0);
    expect(mockResp.sendStatus.mock.calls).toHaveLength(1);
    expect(mockResp.sendStatus.mock.results[0].value).toEqual(400);
  });

  it('should return 400 when missing products', async () => {
    const mockReq = {
      body: {
        userId: '1c2f34cdf3',
        client: 'Anna',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createOrder(mockReq, mockResp, mockNext);

    expect(mockNext.mock.calls).toHaveLength(0);
    expect(mockResp.sendStatus.mock.calls).toHaveLength(1);
    expect(mockResp.sendStatus.mock.results[0].value).toEqual(400);
    expect(mockResp.send.mock.calls).toHaveLength(0);
  });

  it('should create an order into orders collection', async () => {
    const expected = {
      client: 'Anna',
      status: 'pending',
      userId: '1c2f34cdf3',
    };
    const mockReq = {
      body: {
        userId: '1c2f34cdf3',
        client: 'Anna',
        products: [
          {
            product: mockProductId,
            qty: 2,
          },
        ],
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext = jest.fn(code => code);

    await createOrder(mockReq, mockResp, mockNext);

    expect(mockNext.mock.calls).toHaveLength(1);
    expect(mockResp.sendStatus.mock.calls).toHaveLength(0);
    expect(mockResp.send.mock.calls).toHaveLength(1);
    expect(mockResp.send.mock.calls[0][0]).toMatchObject(expected);
  });
});

describe('deleteOrdersById', () => {
  let mockProductId = '';

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

    const mockResp1 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext1 = jest.fn(code => code);

    await createProduct(mockReq1, mockResp1, mockNext1);

    mockProductId = mockResp1.send.mock.calls[0][0]._id;
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get 404 when wrong id', (done) => {
    const mockReq = {
      headers: '',
      params: {
        orderid: 'wrongId',
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

    deleteOrderById(mockReq, mockResp, mockNext);
  });

  it('should delete an order', (done) => {
    let mockOrderId = '';
    const mockReq2 = {
      body: {
        userId: '1c2f34cdf3',
        client: 'Maria',
        products: [
          {
            product: mockProductId,
            qty: 4,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(json => json),
    };
    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    const mockNext2 = () => {
      mockOrderId = mockResp2.send.mock.calls[0][0]._id;
      const mockReq = {
        headers: '',
        params: {
          orderid: mockOrderId,
        },
      };

      deleteOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });
});
describe('getOrdersById', () => {
  let mockProductId = '';

  beforeAll(async () => {
    await db();
    const mockReq1 = {
      headers: '',
      body: {
        name: 'product for test',
        price: '2',
        image: 'newtestimage.jpg',
        type: 'dinner',
      },
    };

    const mockResp1 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext1 = jest.fn(code => code);

    await createProduct(mockReq1, mockResp1, mockNext1);

    mockProductId = mockResp1.send.mock.calls[0][0]._id;
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get 404 when wrong id', (done) => {
    const mockReq = {
      headers: '',
      params: {
        orderid: 'wrongIdTest',
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

    getOrderById(mockReq, mockResp, mockNext);
  });

  it('should get an order by id', (done) => {
    let mockOrderId = '';
    const mockReq2 = {
      body: {
        userId: '1c2f34cdf3',
        client: 'User Test',
        products: [
          {
            product: mockProductId,
            qty: 1,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(json => json),
    };
    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    const mockNext2 = () => {
      mockOrderId = mockResp2.send.mock.calls[0][0]._id;
      const mockReq = {
        headers: '',
        params: {
          orderid: mockOrderId,
        },
      };

      getOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });

  it('should get 404 when not found', (done) => {
    const mockReq2 = {
      body: {
        userId: '1c2f34cdf3',
        client: 'Another User Test',
        products: [
          {
            product: mockProductId,
            qty: 2,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(404);
        done();
      },
    };
    const mockNext = jest.fn(json => json);

    const mockNext2 = () => {
      const mockReq = {
        headers: '',
        params: {
          orderid: '5d33b40104ce5c4d953de36c',
        },
      };

      getOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });
});

describe('updateOrderById', () => {
  let mockProductId = '';

  beforeAll(async () => {
    await db();
    const mockReq1 = {
      headers: '',
      body: {
        name: 'test',
        price: '2',
        image: 'image.jpg',
        type: 'dinner',
      },
    };

    const mockResp1 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockNext1 = jest.fn(code => code);

    await createProduct(mockReq1, mockResp1, mockNext1);

    mockProductId = mockResp1.send.mock.calls[0][0]._id;
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get 404 when wrong id', (done) => {
    const mockReq = {
      headers: '',
      params: {
        orderid: 'wrongId',
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

    updateOrderById(mockReq, mockResp, mockNext);
  });

  it('should update an order by id', (done) => {
    let mockOrderId = '';
    const mockReq2 = {
      body: {
        userId: 'userTest',
        client: 'client',
        products: [
          {
            product: mockProductId,
            qty: 1,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(json => json),
    };
    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    const mockNext2 = () => {
      mockOrderId = mockResp2.send.mock.calls[0][0]._id;
      const mockReq = {
        headers: '',
        params: {
          orderid: mockOrderId,
        },
        body: {
          status: 'delivered',
        },
      };

      updateOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });

  it('should get 404 when not found', (done) => {
    const mockReq2 = {
      body: {
        userId: '1c2f34cdf3',
        client: 'Another User Test',
        products: [
          {
            product: mockProductId,
            qty: 2,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(404);
        done();
      },
    };
    const mockNext = jest.fn(json => json);

    const mockNext2 = () => {
      const mockReq = {
        headers: '',
        params: {
          orderid: '5d33b40104ce5c4d953de36c',
        },
        body: {
          userId: 'userTest',
          client: 'client',
          products: [
            {
              product: mockProductId,
              qty: 1,
            },
          ],
        },
      };

      updateOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });

  it('should get 400 when wrong props', (done) => {
    let mockOrderId = '';
    const mockReq2 = {
      body: {
        userId: '1c2f34cdf3',
        client: 'Another User Test',
        products: [
          {
            product: mockProductId,
            qty: 2,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(400);
        done();
      },
    };
    const mockNext = jest.fn(json => json);

    const mockNext2 = () => {
      mockOrderId = mockResp2.send.mock.calls[0][0]._id;
      const mockReq = {
        headers: '',
        params: {
          orderid: mockOrderId,
        },
        body: {
          userId: 'userTest',
          client: 'client',
          products: 'this products',
        },
      };

      updateOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });

  it('should get 400 when invalid status', (done) => {
    let mockOrderId = '';
    const mockReq2 = {
      body: {
        userId: 'waiter',
        client: 'AnotherTest',
        products: [
          {
            product: mockProductId,
            qty: 2,
          },
        ],
      },
    };

    const mockResp2 = {
      send: jest.fn(json => json),
      sendStatus: jest.fn(code => code),
    };

    const mockResp = {
      send: jest.fn(json => json),
      sendStatus: (code) => {
        expect(mockResp.send.mock.calls).toHaveLength(0);
        expect(code).toEqual(400);
        done();
      },
    };
    const mockNext = jest.fn(json => json);

    const mockNext2 = () => {
      mockOrderId = mockResp2.send.mock.calls[0][0]._id;
      const mockReq = {
        headers: '',
        params: {
          orderid: mockOrderId,
        },
        body: {
          status: 'closed',
        },
      };

      updateOrderById(mockReq, mockResp, mockNext);
    };

    createOrder(mockReq2, mockResp2, mockNext2);
  });
});
