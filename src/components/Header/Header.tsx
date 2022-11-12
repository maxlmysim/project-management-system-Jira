import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { AppBar, Button, Container, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { authSelector, signOut } from '../../store/authSlice';

const fontSize = '1.8rem';

const Header: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLogin, userId } = useAppSelector(authSelector);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (userId) {
      navigate('/');
    }
  }, [userId]);

  const openMenuLanguage = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenuLanguage = (language: string): void => {
    console.log(language);
    setAnchorEl(null);
  };

  function onMainPage(): void {
    navigate('/');
  }

  function onLogin(): void {
    navigate('/login');
  }

  function onSignOut(): void {
    dispatch(signOut());
    navigate('/login');
  }

  function onRegistration(): void {
    navigate('/registration');
  }

  return (
    <AppBar position="static" component="header">
      <Container>
        <Toolbar>
          <Typography component="div" sx={{ flexGrow: 1 }}>
            <Button color="inherit" sx={{ fontSize: fontSize }} onClick={onMainPage}>
              <HomeIcon sx={{ fontSize: '1.2em', marginRight: '5px' }} />
              Главная
            </Button>
          </Typography>
          <Button color="inherit" sx={{ fontSize: fontSize }} onClick={openMenuLanguage}>
            <LanguageIcon sx={{ fontSize: '1.2em', marginRight: '5px' }} />
            RU
          </Button>
          {isLogin ? (
            <Button color="inherit" sx={{ fontSize: fontSize }} onClick={onSignOut}>
              <PersonIcon sx={{ fontSize: '1.2em', marginRight: '5px' }} />
              Выход
            </Button>
          ) : (
            <Button color="inherit" sx={{ fontSize: fontSize }} onClick={onLogin}>
              <PersonIcon sx={{ fontSize: '1.2em', marginRight: '5px' }} />
              Вход
            </Button>
          )}

          <Button color="inherit" sx={{ fontSize: fontSize }} onClick={onRegistration}>
            <LockOpenIcon sx={{ fontSize: '1.2em', marginRight: '5px' }} />
            Регистрация
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={closeMenuLanguage}>
            <MenuItem sx={{ fontSize: fontSize }} onClick={(): void => closeMenuLanguage('RU')}>
              RU
            </MenuItem>
            <MenuItem sx={{ fontSize: fontSize }} onClick={(): void => closeMenuLanguage('EN')}>
              EN
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
