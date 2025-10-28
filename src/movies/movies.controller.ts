import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MoviesService } from './movies.service';
import { SearchMoviesDto } from './dto/search-movies.dto';

@Controller()
export class MoviesController {
  private readonly logger = new Logger('UsersController');
  constructor(private readonly moviesService: MoviesService) {}

  @MessagePattern({ cmd: 'search_movies' })
  async searchMovies(@Payload() searchMoviesDto: any) {
    const data = await this.moviesService.searchMovies(searchMoviesDto);
    if (!data) {
      return this.moviesService.updateCatalog(searchMoviesDto);
    }
    return data
  }

  @MessagePattern({ cmd: 'recommend_movies' })
  async recommendMovies() {
    return this.moviesService.recommendMovies();
  }
}
