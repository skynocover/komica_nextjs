import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Divider, LinkTypeMap } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import dayjs from 'dayjs';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';

import { makeStyles } from '@material-ui/core/styles';
import { Pages } from '../components/Pagination';
import { ListThreads } from '../components/ListThread';
import { ReportForm } from '../components/ReportForm';
import { PostForm } from '../components/PostForm';
import { Thread, Reply } from '.prisma/client';

const pageSize = 8;

interface link {
  name: string;
  url: string;
}

export default function Index({
  threads,
  count,
  topLink,
  headLink,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const id = router.query.id;
  const page = router.query.page ? +router.query.page : 1;
  const pageCount = Math.ceil(count / pageSize);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '& > *': { margin: theme.spacing(1) },
    },
  }));

  const classes = useStyles();

  const TopLink = () => {
    return (
      <div className="flex justify-end">
        <div className={classes.root}>
          <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
            {topLink &&
              topLink.map((item: link, index: number) => (
                <Button href={item.url} target="_blank" key={index}>
                  {item.name}
                </Button>
              ))}
          </ButtonGroup>
        </div>
      </div>
    );
  };

  const Header = () => {
    return (
      <div>
        <div className="flex justify-center">
          <h1 className="text-4xl">{process.env.NEXT_PUBLIC_HEAD_TITLE}</h1>
        </div>
        <div className="flex justify-center">
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            {headLink &&
              headLink.map((item: link, index: number) => (
                <Button color="primary" href={item.url} target="_blank" key={index}>
                  {item.name}
                </Button>
              ))}
          </ButtonGroup>
        </div>
        <Divider />
      </div>
    );
  };

  const Poster = () => {
    return (
      <>
        <PostForm key="postform" />
        <div className="flex justify-center">
          <div className="w-full lg:w-4/12 sm:w-8/12 md:w-1/2 grid grid-cols-1">
            {(process.env.NEXT_PUBLIC_POST_DESCRIBE || '').split(' ').map((item, index) => (
              <Typography variant="subtitle2" gutterBottom key={index}>
                {item}
              </Typography>
            ))}
          </div>
        </div>
      </>
    );
  };

  const BottomLink = () => {
    return (
      <div className="flex justify-center">
        <div className={classes.root}>
          <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
            <Button onClick={appCtx.toggle(true, <ReportForm />)}>錯誤回報</Button>
            <Button onClick={() => router.push('/?page=1')}>回首頁</Button>
          </ButtonGroup>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopLink />
      <Header />
      {!id && <Poster />}
      {!id && <Pages page={page} pageCount={pageCount} />}
      <Divider />
      <ListThreads threads={threads} />
      {!id && <Pages page={page} pageCount={pageCount} />}
      <BottomLink />
    </>
  );
}

const getEnv = (prefix: string): link[] => {
  let value: link[] = [];
  let i = 0;
  while (process.env[`${prefix}${i}`]) {
    value.push({
      name: process.env[`${prefix}${i}`]!.split('@')[0],
      url: process.env[`${prefix}${i}`]!.split('@')[1],
    });
    i++;
  }

  return value;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const id = query.id;
    const page = query.page ? +query.page : 1;

    let temp_thread: (Thread & { Reply: Reply[] })[];
    let count: number;

    if (id) {
      const temp = await prisma.thread.findUnique({
        where: { id: `${id}` },
        include: { Reply: true },
      });

      temp_thread = temp ? [temp] : [];
      count = 1;
    } else {
      temp_thread = await prisma.thread.findMany({
        orderBy: [{ replyAt: 'desc' }],
        include: { Reply: true },
        skip: pageSize * (page - 1),
        take: pageSize,
      });
      count = await prisma.thread.count();
    }

    const threads = temp_thread.map((thread) => {
      return {
        ...thread,
        createdAt: dayjs(thread.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        replyAt: dayjs(thread.replyAt).format('YYYY-MM-DD HH:mm:ss'),
        Reply: thread.Reply.map((reply) => {
          return { ...reply, createdAt: dayjs(reply.createdAt).format('YYYY-MM-DD HH:mm:ss') };
        }),
      };
    });

    const topLink = getEnv('NEXT_PUBLIC_TOP_LINK_');
    const headLink = getEnv('NEXT_PUBLIC_HEAD_LINK_');

    return { props: { threads, count, topLink, headLink } };
  } catch (error: any) {
    console.log(error.message);
    return { props: { error: error.message } };
  }
};
