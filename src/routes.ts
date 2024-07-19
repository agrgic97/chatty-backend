import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { postRoutes } from '@post/routes/postRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { serverAdapter } from '@service/queues/base.queue';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, postRoutes.routes());
  };
  routes();
};
