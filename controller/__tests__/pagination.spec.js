const pagination = require('../pagination');

describe('pagination', () => {
  it('Debería crear la paginación', () => {
    const expected1 = {
      link: '</collection?limit=10&page=1>; rel="first", </collection?limit=10&page=1>; rel="prev", </collection?limit=10&page=1>; rel="next", </collection?limit=10&page=1>; rel="last"',
    };
    const expected2 = {
      link: '</collection?limit=3&page=1>; rel="first", </collection?limit=3&page=4>; rel="prev", </collection?limit=3&page=4>; rel="next", </collection?limit=3&page=4>; rel="last"',
    };
    const expected3 = {
      link: '</collection?limit=2&page=1>; rel="first", </collection?limit=2&page=1>; rel="prev", </collection?limit=2&page=3>; rel="next", </collection?limit=2&page=5>; rel="last"',
    };
    expect(typeof pagination).toBe('function');
    expect(pagination('collection', 10, 1)).toMatchObject(expected1);
    expect(pagination('collection', 10, 5, 3)).toMatchObject(expected2);
    expect(pagination('collection', 10, 2, 2)).toMatchObject(expected3);
  });
});

// collection, count, page, limit
