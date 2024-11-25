/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'User One',
      auth0Sub: '21',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'User Two',
      auth0Sub: '211',
    },
  });

  const board1 = await prisma.board.create({
    data: {
      title: 'Board One',
      author: {
        connect: {
          id: user1.id,
        },
      },
    },
  });

  const task1 = await prisma.task.create({
    data: {
      title: 'Task One',
      desc: 'This is task one',
      order: 0,
      board: {
        connect: {
          id: board1.id,
        },
      },
      author: {
        connect: {
          id: user1.id,
        },
      },
    },
  });

  await prisma.subtask.create({
    data: {
      desc: 'This is subtask one',
      finished: false,
      order: 0,
      task: {
        connect: {
          id: task1.id,
        },
      },
    },
  });

  await prisma.userOnBoard.create({
    data: {
      user: {
        connect: {
          id: user2.id,
        },
      },
      board: {
        connect: {
          id: board1.id,
        },
      },
    },
  });

  await prisma.userOnTask.create({
    data: {
      user: {
        connect: {
          id: user2.id,
        },
      },
      task: {
        connect: {
          id: task1.id,
        },
      },
    },
  });
}

main().catch((e) => {
  throw e;
});
