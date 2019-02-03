import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { Order } from '../db';
import { SIZE_LABELS, SIZE } from '../constants';
import { typedKeys, commaify } from '../util';
import env from '../env';

const router = Router();

// Main render function, puts everything in the same template
interface RenderOptions {
  page: string;
  title: string;
  res: Response;
  args?: object;
  status?: number;
}

function render(opts: RenderOptions) {
  const { res, ...rest } = opts;
  if (opts.status) {
    res.status(opts.status);
  }
  res.render('template', {
    args: {},
    ...rest
  });
}

router.get('/', asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  // Get stock & reformat with some display stuff
  const stockInfo = await Order.getStock();
  const stock = typedKeys(SIZE).map(s => ({
    ...stockInfo[s],
    size: s,
    label: SIZE_LABELS[s],
  }));
  render({
    res,
    page: 'index',
    title: 'Home',
    args: {
      stock,
      price: commaify(env.SHIRT_COST),
    },
  });
}));

router.get('/order', (_: Request, res: Response) => {
  render({
    res,
    page: 'order',
    title: 'Order',
  });
});

router.get('/about', (_: Request, res: Response) => {
  render({
    res,
    page: 'about',
    title: 'About',
  });
});

router.get('*', (_: Request, res: Response) => {
  render({
    res,
    status: 404,
    page: '404',
    title: 'Page not found',
  });
});

export default router;
