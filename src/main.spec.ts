jest.mock('src/config', () => ({ envs: { PORT: 3002 } }));

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('creates microservice, sets pipes and starts listening', async () => {
    const listen = jest.fn().mockResolvedValue(undefined);
    const useGlobalPipes = jest.fn();
    jest.spyOn(NestFactory, 'createMicroservice').mockResolvedValue({
      useGlobalPipes,
      listen,
    } as any);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    require('./main');
    await new Promise((r) => setImmediate(r));

    expect(NestFactory.createMicroservice).toHaveBeenCalledWith(expect.any(Function), {
      transport: Transport.TCP,
      options: { port: 3002 },
    });
    expect(useGlobalPipes).toHaveBeenCalled();
    expect(listen).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Movies Microservice is running on port'));
  });
});