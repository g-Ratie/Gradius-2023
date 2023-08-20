import type { UserId } from '$/commonTypesWithClient/branded';
import type { PlayerModel } from '$/commonTypesWithClient/models';
import { userIdParser } from '$/service/idParsers';
import { prismaClient } from '$/service/prismaClient';
import type { Player } from '@prisma/client';
import { z } from 'zod';

const toPlayerModel = (prismaPlayer: Player): PlayerModel => ({
  userId: userIdParser.parse(prismaPlayer.userId),
  name: z.string().parse(prismaPlayer.name),
  score: z.number().min(0).parse(prismaPlayer.score),
  pos: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .parse(prismaPlayer.pos),
  vector: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .parse(prismaPlayer.vector),
  Items: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array()
    .parse(prismaPlayer.Item),
  side: z.literal('left').or(z.literal('right')).parse(prismaPlayer.side),
});

export const playerRepository = {
  save: async (player: PlayerModel) => {
    const prismaPlayer = await prismaClient.player.upsert({
      where: {
        userId: player.userId,
      },
      update: {
        name: player.name,
        score: player.score,
        vector: player.vector,
        Item: player.Items,
        side: player.side,
      },
      create: {
        userId: player.userId,
        name: player.name,
        score: player.score,
        vector: player.vector,
        Item: player.Items,
        pos: player.pos,
        side: player.side,
      },
    });
    return toPlayerModel(prismaPlayer);
  },
  find: async (userId: UserId) => {
    const player = await prismaClient.player.findUnique({
      where: {
        userId,
      },
    });
    if (!player) {
      return null;
    }
    return toPlayerModel(player);
  },
  findAll: async () => {
    const players = await prismaClient.player.findMany();
    return players.map(toPlayerModel);
  },
  delete: async (userId: UserId) => {
    const player = await prismaClient.player.findUnique({
      where: {
        userId,
      },
    });
    if (!player) return;

    await prismaClient.player.delete({
      where: {
        userId,
      },
    });
  },
};