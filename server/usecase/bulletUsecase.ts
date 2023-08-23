import { bulletRepository } from '$/repository/bulletRepository';
import { bulletIdParser } from '$/service/idParsers';
import { randomUUID } from 'crypto';
import type { BulletModel } from '../commonTypesWithClient/models';

export const bulletUsecase = {
  create: async (shooterId: string): Promise<BulletModel> => {
    //弾の初期値
    const bulletData: BulletModel = {
      bulletId: bulletIdParser.parse(randomUUID()),
      shooterId,
      power: 1,
      vector: { x: 5, y: 0 },
      pos: { x: 50, y: 300 },
      type: 1,
      side: 'left',
    };
    await bulletRepository.save(bulletData);
    return bulletData;
  },
  move: async (bulletModel: BulletModel): Promise<BulletModel | null> => {
    const currentBulletInfo = await bulletRepository.find(bulletModel.bulletId);
    if (currentBulletInfo === null) return null;
    const updateBulletInfo: BulletModel = {
      ...currentBulletInfo,
      pos: {
        x: currentBulletInfo.pos.x + currentBulletInfo.vector.x,
        y: currentBulletInfo.pos.y + currentBulletInfo.vector.y,
      },
    };
    await bulletRepository.save(updateBulletInfo);
    return updateBulletInfo;
  },
  delete: async (bulletModel: BulletModel): Promise<BulletModel | null> => {
    const currentBulletInfo = await bulletRepository.find(bulletModel.bulletId);
    if (currentBulletInfo === null) return null;
    await bulletRepository.delete(bulletModel.bulletId);
    return currentBulletInfo;
  },
  update: async () => {
    const currentBulletList = await bulletRepository.findAll();
    const promises = currentBulletList.map((bullet) => {
      // 画面外に出た弾を削除する、それ以外は移動する
      if (bullet.pos.x > 1920 || bullet.pos.x < 0) {
        return bulletUsecase.delete(bullet);
      } else {
        return bulletUsecase.move(bullet);
      }
    });
    await Promise.all(promises);
  },
};
