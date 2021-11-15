import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { setLog } from '../../utils/setLog';
import { getBinarySize } from '../../utils/getStringSize';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postThread() {
    try {
      const posterId = await setLog(req, 'thread');

      if (posterId === '') {
        res.json(Resp.postLimit);
        return;
      }

      const { title, image, youtubeID, content, name } = req.body;

      if (image && youtubeID) {
        res.json(Resp.paramInputFormateError);
        return;
      }

      if (image && getBinarySize(image) > 4096 * 1000) {
        res.json(Resp.imgLimit);
        return;
      }

      await prisma.thread.create({
        data: {
          posterId,
          title: title,
          name: name ? name : process.env.DEFAULT_POSTNAME || 'no name',
          image,
          youtubeID,
          content,
        },
      });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postThread();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
