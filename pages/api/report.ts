import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { setLog } from '../../utils/setLog';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postReport() {
    try {
      const posterId = await setLog(req, 'report');

      if (posterId === '') {
        res.json(Resp.postLimit);
        return;
      }

      const { postId, reason, content } = req.body;

      await prisma.report.create({ data: { postId, reason, content } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postReport();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
