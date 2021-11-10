import React, { useContext } from 'react';

import Pagination from '@material-ui/lab/Pagination';
import { AppContext } from './AppContext';
import { useRouter } from 'next/router';

export const Pages = ({ page, pageCount }: { page: number; pageCount: number }) => {
  const appCtx = useContext(AppContext);
  const router = useRouter();

  return (
    <div className="flex justify-center m-2">
      <Pagination
        count={pageCount}
        shape="rounded"
        color="primary"
        page={page}
        onChange={(event, value) => router.push(`/?page=${value}`)}
      />
    </div>
  );
};
