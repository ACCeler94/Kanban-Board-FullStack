import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';
import { TaskStatus } from '../../src/types/types';

export const db = factory({
  subtask: {
    id: primaryKey(faker.string.uuid),
    createdAt: faker.date.anytime,
    updatedAt: faker.date.anytime,
    taskId: faker.string.uuid,
    task: oneOf('task'),
    desc: () => faker.lorem.sentence(5),
    finished: () => false,
  },
  task: {
    id: primaryKey(faker.string.uuid),
    createdAt: faker.date.anytime,
    updatedAt: faker.date.anytime,
    title: faker.word.sample,
    desc: () => faker.lorem.sentence(5),
    boardId: faker.string.uuid,
    board: oneOf('board'),
    authorId: faker.string.uuid,
    author: oneOf('user'),
    status: () => TaskStatus.TO_DO,
    order: () => 0,
    assignedUsers: () => [],
    subtasks: manyOf('subtask'),
  },
  user: {
    id: primaryKey(faker.string.uuid),
    name: faker.person.firstName,
    picture: faker.system.filePath,
    email: faker.internet.email,
  },
  board: {
    id: primaryKey(faker.string.uuid),
    createdAt: faker.date.anytime,
    title: faker.word.sample,
    authorId: faker.string.uuid,
    author: oneOf('user'),
    users: () => [],
    tasks: manyOf('task'),
  },
});
