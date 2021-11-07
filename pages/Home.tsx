import React from 'react';
import * as antd from 'antd';

import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainPage } from '../components/MainPage';
import { useRouter } from 'next/router';
import { ColumnsType } from 'antd/lib/table';
import { getSession } from 'next-auth/client';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';
import { DangerButton } from '../components/DangerButton';
import { AddService } from '../modals/AddService';

const Home = ({ services, error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<Service[]>([]); //coulmns data

  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [total, setTotal] = React.useState<number>(0);
  const pageSize = 10;

  interface Service {
    id: number;
    name: string;
  }

  const columns: ColumnsType<Service> = [
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: 'Domain',
      align: 'center',
      dataIndex: 'domain',
    },
    {
      title: 'Port',
      align: 'center',
      dataIndex: 'port',
    },
    {
      align: 'center',
      render: (item) => (
        <DangerButton
          title="刪除"
          message="確認刪除"
          onClick={async () => {
            let data = await appCtx.fetch('delete', `/api/service?id=${item.id}`);
            if (data) {
              router.push('/Home');
              Notification.add('success', 'Delete Success');
            }
          }}
        />
      ),
    },
  ];

  React.useEffect(() => {
    if (error) {
      Notification.add('error', error);
    }
  }, []);

  const content = (
    <>
      <div className="d-flex justify-content-end mb-2">
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(<AddService />);
          }}
        >
          新增
        </antd.Button>
      </div>
      <antd.Table dataSource={services} columns={columns} pagination={false} />
    </>
  );

  return <MainPage content={content} menuKey="Home" />;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const session = await getSession({ req });
    if (!session) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
        props: {},
      };
    }

    const services = await prisma.service.findMany({
      select: { id: true, name: true, domain: true, port: true },
    });
    return { props: { services } };
  } catch (error: any) {
    return { props: { error: error.message } };
  }
};

export default Home;
