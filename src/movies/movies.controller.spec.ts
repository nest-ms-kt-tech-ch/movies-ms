import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: jest.Mocked<MoviesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            searchMovies: jest.fn(),
            updateCatalog: jest.fn(),
            recommendMovies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get(MoviesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('returns cached search results when available', async () => {
    service.searchMovies.mockResolvedValue([{ imdbID: 'tt1' } as any]);

    const res = await controller.searchMovies({ title: 'X' });

    expect(res).toEqual([{ imdbID: 'tt1' }]);
    expect(service.updateCatalog).not.toHaveBeenCalled();
  });

  it('falls back to updateCatalog when no cached results', async () => {
    service.searchMovies.mockResolvedValue(null);
    service.updateCatalog.mockResolvedValue([{ imdbID: 'tt2' } as any]);

    const res = await controller.searchMovies({ title: 'X' });

    expect(service.updateCatalog).toHaveBeenCalled();
    expect(res).toEqual([{ imdbID: 'tt2' }]);
  });

  it('proxies recommendMovies', async () => {
    service.recommendMovies.mockResolvedValue('TODO: Recommended movies for user data');
    const res = await controller.recommendMovies();
    expect(res).toBe('TODO: Recommended movies for user data');
  });
});