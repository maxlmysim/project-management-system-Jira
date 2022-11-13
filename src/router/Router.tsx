import React, { FC } from 'react';
import Login from '../pages/Login';
import Boards from "../pages/Boards";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import WelcomePage from '../pages/WelcomePage';
import Registration from '../pages/Registration';
import { AppRoutes } from '../constants/routes';
import { Route, Routes } from 'react-router-dom';


interface props {
  isLogin: boolean;
}

const Router: FC<props> = ({ isLogin }) => {
  return (
    <Routes>
      {isLogin ? (
        <>
          <Route path={AppRoutes.WELCOME} element={<WelcomePage />} />
          <Route path={AppRoutes.PROFILE} element={<Profile />}/>
          <Route path={AppRoutes.BOARDS} element={<Boards />}/>
        </>
      ) : (
        <>
          <Route path={AppRoutes.WELCOME} element={<WelcomePage />} />
          <Route path={AppRoutes.LOGIN} element={<Login />} />
          <Route path={AppRoutes.REGISTRATION} element={<Registration />} />
        </>
      )}
      <Route path={AppRoutes.NOTFOUND} element={<NotFound />} />
    </Routes>
  );
};

export default Router;
