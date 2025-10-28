import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

jest.mock('src/config', () => ({
  envs: {
    OMDB_HOST: 'https://www.omdbapi.com/',
    OMDB_API_KEY: 'test-key',
  },
}));

import { MoviesService } from './movies.service';
import type { Movie } from '@prisma/client';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(() => {
    service = new MoviesService();
    // Override prisma delegates with fakes for isolation
    (service as any).query = {
      findFirst: jest.fn(),
      create: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('transformResponse', () => {
    it('should map OMDB fields to Movie partials', () => {
      const input = [
        {
          imdbID: 'tt123',
          Title: 'Inception',
          Year: '2010',
          Type: 'movie',
          Poster: 'poster.jpg',
        },
      ];

      const out = service.transformResponse(input as any);
      expect(out).toEqual([
        {
          imdbID: 'tt123',
          title: 'Inception',
          year: 2010,
          type: 'movie',
          poster: 'poster.jpg',
        },
      ]);
    });
  });

  describe('searchMovies', () => {
    it('returns null when no cached query found', async () => {
      (service as any).query.findFirst.mockResolvedValue(null);

      const res = await service.searchMovies({ title: 'Matrix', page: 1 } as any);
      expect(res).toBeNull();
      expect((service as any).query.findFirst).toHaveBeenCalled();
    });

    it('returns results when cached query exists', async () => {
      const results = [{ imdbID: 'tt0133093' }] as unknown as Movie[];
      (service as any).query.findFirst.mockResolvedValue({ results });

      const res = await service.searchMovies({ title: 'Matrix', page: 1 } as any);
      expect(res).toBe(results);
    });
  });

  describe('updateCatalog', () => {
    beforeEach(() => {
      // @ts-ignore
      global.fetch = jest.fn();
    });

    it('fetches from OMDB, saves query, and returns raw Search', async () => {
      const search = [
        { imdbID: 'tt1', Title: 'A', Year: '2000', Type: 'movie', Poster: 'a.jpg' },
      ];
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ Search: search }),
      });
      const saveSpy = jest
        .spyOn(service, 'saveSearchQuery')
        .mockResolvedValue({} as any);

      const query = { title: 'Terminator', year: 1984, page: 2, userId: '1' } as any;
      const res = await service.updateCatalog(query);

      // URL must include query params
      const calledUrl = String((global.fetch as jest.Mock).mock.calls[0][0]);
      expect(calledUrl).toContain('https://www.omdbapi.com/');
      expect(calledUrl).toContain('apikey=test-key');
      expect(calledUrl).toContain('s=Terminator');
      expect(calledUrl).toContain('y=1984');
      expect(calledUrl).toContain('page=2');

      expect(saveSpy).toHaveBeenCalledWith(query, [
        { imdbID: 'tt1', title: 'A', year: 2000, type: 'movie', poster: 'a.jpg' },
      ]);
      expect(res).toBe(search);
    });

    it('throws BAD_REQUEST when OMDB returns no results', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ json: async () => ({}) });

      await expect(
        service.updateCatalog({ title: 'X' } as any),
      ).rejects.toEqual(
        new RpcException({ message: 'Error fetching data from OMDB API', status: HttpStatus.BAD_REQUEST }),
      );
    });

    it('throws BAD_REQUEST on fetch/json error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));

      await expect(
        service.updateCatalog({ title: 'X' } as any),
      ).rejects.toEqual(
        new RpcException({ message: 'Error fetching data from OMDB API', status: HttpStatus.BAD_REQUEST }),
      );
    });
  });

  describe('saveSearchQuery', () => {
    it('filters out movies with missing required fields', async () => {
      const createMock = (service as any).query.create as jest.Mock;
      createMock.mockResolvedValue({ id: 1 });

      const data: Partial<Movie>[] = [
        { imdbID: 'tt1', title: 'A', year: 2000, type: 'movie', poster: 'a.jpg' },
        { imdbID: 'tt2', title: undefined as any, year: 2001, type: 'movie', poster: 'b.jpg' },
        { imdbID: 'tt3', title: 'C', year: undefined as any, type: 'movie', poster: 'c.jpg' },
      ];

      await service.saveSearchQuery({ title: 'A', page: 1, userId: '2' } as any, data);

      expect(createMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          results: {
            createMany: {
              data: [
                { imdbID: 'tt1', title: 'A', year: 2000, type: 'movie', poster: 'a.jpg' },
              ],
            },
          },
        }),
      });
    });
  });
});