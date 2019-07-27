const _ = require('lodash');

const {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
} = require('../../controller/users');

jest.mock('../../libs/connection');

const db = require('../../libs/connection');

describe('createUser', () => {
  beforeAll(async () => {
    await db();
  });

  afterAll(async () => {
    await db().close();
  });

  it('should insert a user into users collection', async () => {
    const mockReq = {
      headers: '',
      body: {
        email: 'usertest@mail.com',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = jest.fn(code => code);

    await createUser(mockReq, mockResp, mockNext);

    expect(_.omit(mockResp.send.mock.calls[0][0], '_id')).toEqual({
      email: 'usertest@mail.com',
      roles: {
        admin: false,
      },
    });
    // expect(_.pick(mockResp.send.mock.calls[0][0], '_id').toString()).toHaveLength(24);
    expect(mockNext.mock.calls).toHaveLength(1);
    expect(mockNext.mock.calls[0][0]).toBe(undefined);
    expect(mockResp.send.mock.calls).toHaveLength(1);
  });

  it('should return 400 when missing props', async () => {
    const mockReq = {
      headers: '',
      body: {},
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = jest.fn(code => code);

    await createUser(mockReq, mockResp, mockNext);
    expect(mockNext.mock.calls).toHaveLength(1);
    expect(mockNext.mock.calls[0][0]).toBe(400);
    expect(mockResp.send.mock.calls).toHaveLength(0);
  });

  it('should create user when missing roles', async () => {
    const mockReq = {
      headers: '',
      body: {
        email: 'mailtest@mail.com',
        password: '123456',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = jest.fn(code => code);

    await createUser(mockReq, mockResp, mockNext);
    expect(mockNext.mock.calls).toHaveLength(1);
    expect(mockNext.mock.calls[0][0]).toBe(undefined);
    expect(mockResp.send.mock.calls).toHaveLength(1);
  });
});

describe('getUsers', () => {
  beforeAll(async () => {
    const mockReq1 = {
      headers: '',
      body: {
        email: 'secondtest@mail.com',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const mockReq2 = {
      headers: '',
      body: {
        email: 'thirdtest@mail.com',
        password: '12bcde',
        roles: {
          admin: false,
        },
      },
    };
    const mockResp = {
      send: jest.fn(json => json),
    };
    const mockNext = jest.fn(code => code);
    await db();
    await createUser(mockReq1, mockResp, mockNext);
    await createUser(mockReq2, mockResp, mockNext);
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get users collection', (done) => {
    const mockReq = {
      headers: '',
      query: {
        limit: 2,
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

    getUsers(mockReq, mockResp, mockNext);
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

    getUsers(mockReq, mockResp, mockNext);
  });
});

describe('getUserById', () => {
  beforeAll(async () => {
    const mockReq1 = {
      headers: '',
      body: {
        email: 'secondtest@mail.com',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const mockReq2 = {
      headers: '',
      body: {
        email: 'thirdtest@mail.com',
        password: '12bcde',
        roles: {
          admin: false,
        },
      },
    };
    const mockResp = {
      send: jest.fn(json => json),
    };
    const mockNext = jest.fn(code => code);
    await db();
    await createUser(mockReq1, mockResp, mockNext);
    await createUser(mockReq2, mockResp, mockNext);
  });

  afterAll(async () => {
    await db().close();
  });

  it('should get user by email', (done) => {
    const mockReq = {
      headers: '',
      params: {
        uid: 'thirdtest@mail.com',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      set: jest.fn((prop, value) => value),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    getUserById(mockReq, mockResp, mockNext);
  });

  it('should get user by email', (done) => {
    const mockReq = {
      headers: '',
      params: {
        uid: 'wrongmail@mail.com',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
      set: jest.fn((prop, value) => value),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(0);
      expect(code).toEqual(404);
      done();
    };

    getUserById(mockReq, mockResp, mockNext);
  });
});

describe('updateUserById', () => {
  beforeAll(async () => {
    const mockReq1 = {
      headers: '',
      body: {
        email: 'secondtest@mail.com',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const mockReq2 = {
      headers: '',
      body: {
        email: 'thirdtest@mail.com',
        password: '12bcde',
        roles: {
          admin: false,
        },
      },
    };
    const mockResp = {
      send: jest.fn(json => json),
    };
    const mockNext = jest.fn(code => code);
    await db();
    await createUser(mockReq1, mockResp, mockNext);
    await createUser(mockReq2, mockResp, mockNext);
  });

  afterAll(async () => {
    await db().close();
  });

  it('should update email user by email', (done) => {
    const mockReq = {
      header: {
        user: {
          roles: {
            admin: true,
          },
        },
      },
      params: {
        uid: 'thirdtest@mail.com',
      },
      body: {
        email: 'newthirdtest@mail.com',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    updateUserById(mockReq, mockResp, mockNext);
  });

  it('should update password and roles user by email', (done) => {
    const mockReq = {
      header: {
        user: {
          roles: {
            admin: true,
          },
        },
      },
      params: {
        uid: 'secondtest@mail.com',
      },
      body: {
        password: 'xxxxx',
        roles: {
          admin: false,
        },
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    updateUserById(mockReq, mockResp, mockNext);
  });

  it('should return 400 when missing props', (done) => {
    const mockReq = {
      header: {
        user: {
          roles: {
            admin: true,
          },
        },
      },
      params: {
        uid: 'newthirdtest@mail.com',
      },
      body: {},
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(0);
      expect(code).toEqual(400);
      done();
    };

    updateUserById(mockReq, mockResp, mockNext);
  });

  it('should return 404 when not found', (done) => {
    const mockReq = {
      header: {
        user: {
          roles: {
            admin: true,
          },
        },
      },
      params: {
        uid: 'wrongtest@mail.com',
      },
      body: {
        email: 'newtest@mail.com',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(0);
      expect(code).toEqual(404);
      done();
    };

    updateUserById(mockReq, mockResp, mockNext);
  });

  it('should return 403 not admin and update role', (done) => {
    const mockReq = {
      header: {
        user: {
          roles: {
            admin: false,
          },
        },
      },
      params: {
        uid: 'secondtest@mail.com',
      },
      body: {
        email: 'newtest@mail.com',
        roles: {
          admin: true,
        },
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(0);
      expect(code).toEqual(403);
      done();
    };

    updateUserById(mockReq, mockResp, mockNext);
  });
});

describe('deleteUserById', () => {
  beforeAll(async () => {
    const mockReq1 = {
      headers: '',
      body: {
        email: 'secondtest@mail.com',
        password: '123456',
        roles: {
          admin: false,
        },
      },
    };
    const mockReq2 = {
      headers: '',
      body: {
        email: 'thirdtest@mail.com',
        password: '12bcde',
        roles: {
          admin: false,
        },
      },
    };
    const mockResp = {
      send: jest.fn(json => json),
    };
    const mockNext = jest.fn(code => code);
    await db();
    await createUser(mockReq1, mockResp, mockNext);
    await createUser(mockReq2, mockResp, mockNext);
  });

  afterAll(async () => {
    await db().close();
  });

  it('should delete user by email', (done) => {
    const mockReq = {
      params: {
        uid: 'thirdtest@mail.com',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(1);
      expect(code).toEqual(undefined);
      done();
    };

    deleteUserById(mockReq, mockResp, mockNext);
  });

  it('should return 404 when wrong email', (done) => {
    const mockReq = {
      params: {
        uid: 'wrong@mail.com',
      },
    };

    const mockResp = {
      send: jest.fn(json => json),
    };

    const mockNext = (code) => {
      expect(mockResp.send.mock.calls).toHaveLength(0);
      expect(code).toEqual(404);
      done();
    };

    deleteUserById(mockReq, mockResp, mockNext);
  });
});
