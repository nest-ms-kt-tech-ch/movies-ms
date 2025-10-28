import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { MoviesService } from './movies/movies.service';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MoviesService)
      .useValue({})
      .compile();

    expect(moduleRef).toBeDefined();
  });
});