
const {
  //getUsers,
  //getUserById,
  createUser,
  //updateUserById,
  //deleteUserById,
} = require('../../controller/users');

jest.mock('../../libs/connection')

const db = require('../../libs/connection');

describe('createUser', () => {
  

  beforeAll(async () => {
    await db();
  });

  afterAll(() => {
    db().close()
  });

  it('should insert a user into users collection', async () => {
  
    const mockReq = {
      headers: '',
      body: {
        email: 'usertest@mail.com',
        password: '123456',
        roles: {
          admin: false,
        }
      }
    };

    const mockResp = {
      send: jest.fn((json) => json),
    };

    const mockNext = jest.fn((code) => code);

    await createUser(mockReq, mockResp, mockNext);
    
    //expect(omit(mockResp.send.mock[0][0], '_id')).toEqual({
    //    email: 'usertest@mail.com',
    //    roles: {
    //      admin: false,
    //    }
    //  });
    //expect(pick(mockResp.send.mock[0][0], '_id').toString()).toHaveLength(24);
    expect(mockNext.mock.calls).toHaveLength(1);
    expect(mockNext.mock.calls[0][0]).toBe(undefined);
    expect(mockResp.send.mock.calls).toHaveLength(1);

  });
})
