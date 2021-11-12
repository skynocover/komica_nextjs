import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';

import { prisma } from '../../database/db';
import { Resp } from '../../resp/resp';
import { setLog } from '../../utils/setLog';
import { getBinarySize } from '../../utils/getStringSize';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postReply() {
    try {
      const posterId = await setLog(req, 'reply');

      if (posterId === '') {
        res.json(Resp.postLimit);
        return;
      }

      const { image, youtubeID, content, name, sage, parentId } = req.body;

      if (image && youtubeID) {
        res.json(Resp.paramInputFormateError);
        return;
      }

      if (image && getBinarySize(image) > 4096 * 1000) {
        res.json(Resp.imgLimit);
        return;
      }

      await prisma.reply.create({
        data: {
          posterId,
          name: name ? name : process.env.DEFAULT_POSTNAME || 'no name',
          image,
          youtubeID,
          content,
          sage,
          Thread: { connect: { id: parentId } },
        },
      });

      if (!sage) {
        await prisma.thread.update({
          data: { replyAt: dayjs().toDate() },
          where: { id: parentId },
        });
      }

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postReply();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};
