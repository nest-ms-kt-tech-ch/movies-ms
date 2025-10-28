import { Test } from '@nestjs/testing';
import { MoviesModule } from './movies.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

describe('MoviesModule', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MoviesModule],
    }).compile();

    expect(moduleRef.get(MoviesController)).toBeDefined();
    expect(moduleRef.get(MoviesService)).toBeDefined();
  });
});
