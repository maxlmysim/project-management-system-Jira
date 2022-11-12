import React, { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Avatar, Box, Button, Container, styled, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { signIn } from '../store/authSlice';
import { useAppDispatch } from '../hooks/storeHooks';
import { User } from '../api/authService';

const Form = styled('form')`
  label,
  input {
    font-size: 1.5rem;
  }

  legend {
    font-size: 1.1rem;
  }

  p {
    font-size: 1.3rem;
  }
`;

const Login: FC = () => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<User> = (data) => {
    dispatch(signIn(data));
  };

  return (
    <Container component="main">
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}
      >
        <Avatar sx={{ backgroundColor: 'rgb(156, 39, 176);' }}>
          <LockOutlinedIcon sx={{ width: '70%', height: 'auto' }} />
        </Avatar>
        <Typography variant="h3" component="h3" sx={{ textAlign: 'center', margin: '0 auto 1rem' }}>
          Вход
        </Typography>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            maxWidth: '400px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          <TextField
            label="Логин"
            {...register('login', {
              required: {
                value: true,
                message: 'Это поле обязательно!',
              },
              minLength: {
                value: 3,
                message: 'Длинна логина должна быть больше 3 ',
              },
            })}
            placeholder="Введите ваш логин"
            sx={{ width: 1 }}
            error={!!errors.login}
            helperText={errors.login && errors.login.message}
          />
          <TextField
            label="Пароль"
            {...register('password', {
              required: {
                value: true,
                message: 'Это поле обязательно!',
              },
              minLength: {
                value: 8,
                message: 'Длинна пароля должна быть 8 символов или более ',
              },
            })}
            type="password"
            placeholder="Введите ваш пароль"
            sx={{ width: 1 }}
            error={!!errors.password}
            helperText={errors.password && errors.password.message}
          />
          <Button variant="contained" type="submit" sx={{ width: 1, fontSize: '1.5rem' }}>
            Войти
          </Button>
        </Form>
      </Box>
    </Container>
  );
};

export default Login;
