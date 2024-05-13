/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'User One',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'User Two',
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
