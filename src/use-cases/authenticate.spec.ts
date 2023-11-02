import { hash } from 'bcryptjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository';

import { AuthenticateUseCase } from './authenticate';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';

let sut: AuthenticateUseCase
let usersRepository: InMemoryUsersRepository

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  it('should be able to authenticate', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('1231234', 6),
    })

    const { user } = await sut.execute({
      email: 'johndoe@example.com',
      password: '1231234',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong email', async () => {
    expect(() => {
      return sut.execute({
        email: 'johndoe@example.com',
        password: '123456',
      })
    }).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    expect(() => {
      return sut.execute({
        email: 'johndoe@example.com',
        password: '123123',
      })
    }).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})