import React, { useContext } from 'react';

import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import ReportIcon from '@material-ui/icons/Report';
import ReplyRoundedIcon from '@material-ui/icons/ReplyRounded';
import Link from '@material-ui/core/Link';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

import { ReportForm } from './ReportForm';
import { PostForm } from './PostForm';
import { Image } from './Image';
import { useRouter } from 'next/router';
import { AppContext, thread, reply } from './AppContext';

export const ListThreads = ({ threads }: { threads: any }) => {
  const appCtx = useContext(AppContext);
  const router = useRouter();

  const useStyles = makeStyles((theme) => ({
    root: { width: '100%' },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }));

  const ThreadLabel = ({ post }: { post: any }) => {
    const appCtx = useContext(AppContext);

    return (
      <div className="flex pt-2 items-center justify-center">
        {post.title ? (
          <Link href={`/?id=${post.id}`} underline="always">
            <span className="text-red-600"> {post.title}</span>
            <span className="text-blue-400">{post.name}</span>
            <span className="text-gray-400 ">
              [{post.createdAt} ID:{post.posterId}]
            </span>
          </Link>
        ) : (
          <>
            <span className="text-blue-400">{post.name}</span>
            <span className="text-gray-400 ">
              [{post.createdAt} ID:{post.posterId}]
            </span>
          </>
        )}
        <IconButton size="small" onClick={appCtx.toggle(true, <ReportForm id={post.id} />)}>
          <ReportIcon />
        </IconButton>
        {post.title && (
          <IconButton
            aria-label="delete"
            size="small"
            onClick={appCtx.toggle(true, <PostForm key="postform_reply" parentId={post.id} />)}
          >
            <ReplyRoundedIcon />
          </IconButton>
        )}
      </div>
    );
  };

  const Post = ({ post, outside }: { post: reply | thread; outside: boolean }) => {
    const contentClassName = clsx(
      `md:col-start-${outside ? '2' : '1'}`,
      `md:col-span-${outside ? '2' : '3'}`,
    );
    const markdownClassName = clsx(`md:col-span-${outside ? '2' : '3'} ml-2`);
    return (
      <div>
        <ThreadLabel post={post} />
        <div className="grid grid-cols-1 md:grid-cols-6">
          {post.image || post.youtubeID ? (
            <div className={contentClassName}>
              {post.image ? (
                <Image image={post.image} />
              ) : (
                <div className="relative" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${post.youtubeID}`}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="col-span-0 md:col-end-3"></div>
          )}

          <div className={markdownClassName}>
            <ReactMarkdown children={post.content} />
          </div>
        </div>
      </div>
    );
  };

  const Thread = ({ thread }: { thread: thread }) => {
    const classes = useStyles();
    const appCtx = useContext(AppContext);
    const showReply = router.query.id ? thread.Reply?.length! : 3; //如果非一頁式瀏覽最多顯示回應數

    return (
      <>
        <Post post={thread} outside={true} />
        {thread.Reply?.length! > showReply && (
          <div className="grid grid-cols-1 md:grid-cols-6 ">
            <Accordion className="md:col-start-2 md:col-span-4">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>被隱藏的回應</Typography>
              </AccordionSummary>

              <AccordionDetails className="flex justify-center">
                <div className="grid gird-cols-1">
                  {thread.Reply?.filter(
                    (item: any, index: any) => index < thread.Reply?.length! - showReply,
                  ).map((item: any) => (
                    <Post key={item.id} post={item} outside={false} />
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        )}

        {thread.Reply?.filter(
          (item: any, index: any) => index >= thread.Reply?.length! - showReply,
        ).map((item: any) => (
          <Post key={item.id} post={item} outside={true} />
        ))}
        <Divider className="flex" />
      </>
    );
  };

  return <>{threads && threads.map((item: any) => <Thread key={item.id} thread={item} />)}</>;
};
