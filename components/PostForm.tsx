import React, { useContext } from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Checkbox from '@material-ui/core/Checkbox';
import NavigationIcon from '@material-ui/icons/Navigation';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { Formik, useField, useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import { useRouter } from 'next/router';

import { AppContext, thread } from './AppContext';

const useStyles = makeStyles((theme) => ({
  margin: { margin: theme.spacing(1) },
  extendedIcon: { marginRight: theme.spacing(1) },
}));

const toBase64 = (file: any) =>
  new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

interface FormProps {
  title: string;
  name: string;
  content: string;
  image: File | undefined;
  youtubeURL: string;
  sage: boolean;
}

const youtubeURL_Regex =
  /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

export const PostForm = ({ parentId }: { parentId?: string }) => {
  const appCtx = useContext(AppContext);
  const classes = useStyles();
  const router = useRouter();

  const formik = useFormik<FormProps>({
    initialValues: {
      title: '',
      name: '',
      content: '',
      image: undefined,
      youtubeURL: '',
      sage: false,
    },
    validateOnChange: false,
    validate: (values) => {
      let errors: any = {};
      if (!parentId && !values.title) errors.title = '標題必填';
      if (!values.content) errors.content = '內文必填';
      if (values.image && values.youtubeURL) errors.youtubeURL = 'youtube連結及圖片只能擇一';

      if (values.youtubeURL && !youtubeURL_Regex.test(values.youtubeURL))
        errors.youtubeURL = 'youtube連結格式錯誤';

      return errors;
    },
    onSubmit: async (values, action) => {
      const baseimage = values.image ? await toBase64(values.image) : '';
      const matchurl = values.youtubeURL?.match(youtubeURL_Regex);
      const youtubeID = matchurl ? matchurl[1] : '';

      if (parentId) {
        await appCtx.Request(
          {
            image: baseimage,
            youtubeID,
            content: values.content,
            name: values.name,
            sage: values.sage,
            parentId: parentId,
          },
          'reply',
          '回覆成功',
        );
      } else {
        await appCtx.Request(
          {
            title: values.title,
            image: baseimage,
            youtubeID,
            content: values.content,
            name: values.name,
          },
          'thread',
          '發文成功',
        );
      }

      appCtx.setDrawOpen(false);
      action.resetForm();

      router.push(parentId ? `/?id=${parentId}` : '/?page=1');
    },
  });

  // for upload input id
  const id = Math.floor(Math.random() * 1000).toString();

  return (
    <div className="flex justify-center">
      <div className="lg:w-1/3 md:w-1/2 sm:w-2/3 w-full grid grid-cols-1">
        {!parentId && (
          <TextField
            error={formik.errors.title ? true : false}
            helperText={formik.errors.title}
            name="title"
            label="標題"
            variant="filled"
            value={formik.values.title}
            onChange={formik.handleChange}
          />
        )}

        <TextField
          name="name"
          label="名稱"
          variant="filled"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <TextField
          error={formik.errors.content ? true : false}
          helperText={formik.errors.content}
          name="content"
          onChange={formik.handleChange}
          multiline
          rows={4}
          label="內文"
          variant="filled"
          value={formik.values.content}
          placeholder="可使用markdown語法"
        />
        <TextField
          error={formik.errors.youtubeURL ? true : false}
          helperText={formik.errors.youtubeURL}
          name="youtubeURL"
          label="youtube連結"
          variant="filled"
          value={formik.values.youtubeURL}
          onChange={formik.handleChange}
        />

        <div className="flex items-center">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={id}
            type="file"
            onChange={(e) => {
              const files = e?.target?.files!;
              formik.setFieldValue('image', files[0]);
            }}
          />
          <label htmlFor={id} className="justify-center">
            <Button variant="contained" component="span">
              Upload
            </Button>
          </label>
          <div className={'flex items-center'}>{formik.values.image?.name}</div>

          <div className="flex-1" />
          <Fab
            variant="extended"
            color="primary"
            aria-label="add"
            className={classes.margin}
            size="small"
            onClick={() => formik.handleSubmit()}
          >
            {parentId ? '回文' : '發文'}
            <NavigationIcon className={classes.extendedIcon} />
          </Fab>

          {parentId && (
            <FormControlLabel
              value="sage"
              control={
                <Checkbox onChange={(e) => formik.setFieldValue('sage', e?.target?.checked)} />
              }
              label="sage"
              labelPlacement="end"
            />
          )}
        </div>
      </div>
    </div>
  );
};
