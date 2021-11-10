import React from 'react';
import axios from 'axios';

import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { PostForm } from './PostForm';
import { Notification } from '../components/Notification';

export interface thread {
  id?: string;
  posterId?: string;
  title: string;
  image?: string;
  youtubeID?: string;
  content: string;
  name?: string;
  Reply?: reply[];
  createdAt?: string;
}

export interface reply {
  id?: string;
  parentId: string;
  posterId?: string;
  image?: string;
  youtubeID?: string;
  content: string;
  name?: string;
  sage: boolean;
  createdAt?: string;
}

export interface report {
  postId?: string;
  reason: string;
  content: string;
}

interface AppContextProps {
  fetch: (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    param?: any,
  ) => Promise<any>;

  Request: (post: thread | reply | report, route: string, successLabel: string) => Promise<void>;

  toggle: (open: any, form: any) => (event: any) => void;
  setDrawOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = React.createContext<AppContextProps>(undefined!);

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  // toggle
  const [drawOpen, setDrawOpen] = React.useState(false);
  const [Form, setForm] = React.useState<any>(<PostForm />);

  const toggle = (open: any, form: any) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    open && setForm(form);
    setDrawOpen(open);
  };

  // success drawer
  const [success, setSuccess] = React.useState(false);
  const [successLabel, setSuccessLabel] = React.useState('success');
  const [severity, setSeverity] = React.useState<any>('success');
  const SuccessClose = (_event: any, reason: any) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccess(false);
  };

  // api ...
  const Request = async (post: thread | reply | report, route: string, successLabel: string) => {
    try {
      const { data } = await axios.post(`/api/${route}`, { ...post });
      if (data.errorCode === 0) {
        setSuccessLabel(successLabel);
        setSeverity('success');
        setSuccess(true);
      } else {
        setSeverity('error');
        setSuccessLabel(data.errorMessage);
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /////////////////////////////////////////////////////

  React.useEffect(() => {
    axios.defaults.baseURL = '';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, []);

  const fetch = async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    param?: any,
  ) => {
    let data: any = null;
    try {
      const response = await axios({
        method,
        url,
        data: param,
      });
      console.log('response', response.data);

      if (response.data.errorCode !== 0) {
        throw new Error(response.data.errorMessage);
      }

      data = response.data;
    } catch (error: any) {
      Notification.add('error', error.message);
    }
    return data;
  };

  /////////////////////////////////////////////////////

  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
  }));
  const classes = useStyles();

  return (
    <AppContext.Provider
      value={{
        fetch,

        setDrawOpen,

        Request,
        toggle,
      }}
    >
      {children}

      <div className={classes.root}>
        <Snackbar open={success} autoHideDuration={1500} onClose={SuccessClose}>
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => setSuccess(false)}
            severity={severity}
          >
            {successLabel}
          </MuiAlert>
        </Snackbar>
      </div>

      <Drawer anchor="bottom" open={drawOpen} onClose={toggle(false, null)}>
        <div className="m-3">{Form}</div>
      </Drawer>
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
