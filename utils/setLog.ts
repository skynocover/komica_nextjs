import requestIp from 'request-ip';
import { prisma } from '../database/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import md5 from 'md5';

const LIMIT_POST_COUNT = +(process.env.LIMIT_POST_COUNT || '');
const LIMIT_POST_MINUTE = +(process.env.LIMIT_POST_MINUTE || '');

const limit_post_count = isNaN(LIMIT_POST_COUNT) ? 3 : LIMIT_POST_COUNT;
const limit_post_minute = isNaN(LIMIT_POST_MINUTE) ? 5 : LIMIT_POST_MINUTE;

export const postLimit = `發文限制為每${limit_post_minute}分鐘${limit_post_count}次`;

export const setLog = async (req: NextApiRequest, action: 'thread' | 'reply' | 'report') => {
  const ip = requestIp.getClientIp(req) || '';

  const count = await prisma.log.count({
    where: { ip, createdAt: { gte: dayjs().subtract(limit_post_minute, 'm').toDate() } },
  });

  if (count > limit_post_count) return '';

  await prisma.log.create({ data: { ip, action } });

  return md5(`${dayjs().format('YYYY-MM-DD')}${ip}`).substr(0, 13);
};
