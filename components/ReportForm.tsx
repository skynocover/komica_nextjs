import React, { useContext } from 'react';

import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import NavigationIcon from '@material-ui/icons/Navigation';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Formik, useFormik } from 'formik';

import { AppContext } from './AppContext';

export const ReportForm = ({ id }: { id?: string }) => {
  const appCtx = useContext(AppContext);

  const useStyles = makeStyles((theme) => ({
    formControl: { margin: theme.spacing(1), minWidth: 120 },
  }));

  const classes = useStyles();

  const formik = useFormik({
    initialValues: { reason: 'del', content: '' },
    validateOnChange: false,
    validate: (values) => {
      let errors: any = {};
      if (!values.content) errors.content = '回報內容必填';
      return errors;
    },
    onSubmit: async (values, action) => {
      appCtx.Request(
        { postId: id, reason: values.reason, content: values.content },
        'report',
        '回報成功',
      );

      appCtx.setDrawOpen(false);
      action.resetForm();
    },
  });

  return (
    <div className="flex justify-center">
      <div className="lg:w-1/3 md:w-1/2 sm:w-2/3 w-full grid grid-cols-1 ">
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="demo-simple-select-filled-label">回報原因</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
          >
            <MenuItem value={'del'}>刪文請求</MenuItem>
            <MenuItem value={'bug'}>Bug</MenuItem>
            <MenuItem value={'war'}>引戰</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="filled-basic"
          multiline
          error={formik.errors.content ? true : false}
          helperText={formik.errors.content}
          rows={4}
          label="回報內容"
          variant="filled"
          placeholder="可使用markdown語法"
          name="content"
          onChange={formik.handleChange}
        />
        <Fab
          variant="extended"
          color="primary"
          aria-label="add"
          size="small"
          onClick={() => formik.handleSubmit()}
        >
          <NavigationIcon />
          回報
        </Fab>
      </div>
    </div>
  );
};
