import { Sequelize } from 'sequelize-typescript';
import env from '../env';
 
export const sequelize =  new Sequelize({
  url: env.DATABASE_URL,
  modelPaths: [__dirname + '/models'],
  operatorsAliases: false,
  logging: true,
});

export default sequelize;