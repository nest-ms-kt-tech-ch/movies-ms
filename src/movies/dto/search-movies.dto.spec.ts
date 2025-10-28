import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchMoviesDto } from './search-movies.dto';

describe('SearchMoviesDto', () => {
  it('transforms year to number', async () => {
    const dto = plainToInstance(SearchMoviesDto, { title: 'Inception', year: '2010' });
    expect(typeof (dto as any).year).toBe('number');
    expect((dto as any).year).toBe(2010);
  });

  it('transforms userId to number despite type annotation', async () => {
    const dto = plainToInstance(SearchMoviesDto, { title: 'A', userId: '42' });
    expect(typeof (dto as any).userId).toBe('number');
    expect((dto as any).userId).toBe(42);
  });

  it('fails validation when title is empty', async () => {
    const dto = plainToInstance(SearchMoviesDto, { title: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map(e => e.property)).toContain('title');
  });
});