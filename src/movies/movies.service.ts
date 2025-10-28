import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { envs } from 'src/config';
import { Movie, PrismaClient, Query } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class MoviesService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('MoviesService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  transformResponse(response: any[]): Partial<Movie>[] {
    return response.map(item => ({
      imdbID: item.imdbID,
      title: item.Title,
      year: Number(item.Year),
      type: item.Type,
      poster: item.Poster,
    }));
  }

  async updateCatalog(query: SearchMoviesDto) {
    try {
      const url = new URL(envs.OMDB_HOST);
      url.searchParams.append('apikey', envs.OMDB_API_KEY);
      url.searchParams.append('s', query.title);
      if (query.year) {
        url.searchParams.append('y', query.year.toString());
      }
      if (query.page) {
        url.searchParams.append('page', query.page.toString());
      }
      const data = await fetch(url)
      const { Search: search } = await data.json();
      if (!search) {
        this.logger.debug('No movies found from OMDB API');
        throw new RpcException({
          message: 'No movies found',
          status: HttpStatus.NOT_FOUND,
        });
      }
      this.logger.log(`Fetched ${search.length} movies from OMDB API for query: ${JSON.stringify(query)}`);
      await this.saveSearchQuery(query, this.transformResponse(search));
      return search;
    } catch (error) {
      throw new RpcException({
        message: 'Error fetching data from OMDB API',
        status: HttpStatus.BAD_REQUEST,
      })
    }
  }

  async searchMovies(query: SearchMoviesDto) {
    const queryResult = await this.query.findFirst({
      where: {
        title: {
          contains: query.title,
        },
        year: query.year,
        page: query.page ?? 1,
      },
      include: { results: true },
    });

    if (!queryResult || !queryResult.results) {
      this.logger.debug('No matching query found');
      return null;
    }

    return queryResult.results;
  }

  saveSearchQuery(query: SearchMoviesDto, data: Partial<Movie>[]) {
    this.logger.debug('Saving search query to the database');
    return this.query.create({
      data: {
        title: query.title,
        year: query.year,
        page: query.page ?? 1,
        userId: query.userId ? Number(query.userId) : 0,
        results: {
          createMany: {
            data: data
              .filter(movie => movie.imdbID && movie.title && movie.year && movie.type && movie.poster) // Ensure all required fields are defined
              .map(movie => ({
                imdbID: movie.imdbID!,
                title: movie.title!,
                year: movie.year!,
                type: movie.type!,
                poster: movie.poster!,
              })),
          },
        },
      },
    });
  }

  recommendMovies() {
    // Lógica para recomendar películas basadas en los datos del usuario usando IA
    return `TODO: Recommended movies for user data`;
  }
}
