import { Op } from 'sequelize';
import { Table, Column, Model, Default } from 'sequelize-typescript';
import { SIZE } from '../../constants';
import env from '../../env';

@Table({ timestamps: true, paranoid: true })
export class Order extends Model<Order> {
  // Lightning invoice info (All required)
  @Column({ allowNull: false })
  pubkey!: string;

  @Column({ allowNull: false, unique: true })
  paymentRequest!: string;

  @Column({ allowNull: false, unique: true })
  rHash!: string;

  @Column({ allowNull: false, unique: true })
  addIndex!: number;

  @Column({ allowNull: false })
  expires!: Date;

  @Column({ allowNull: false })
  hasPaid!: boolean;

  // Order details (All except size optional, come after invoice creation)
  @Column({ allowNull: false })
  size!: string;

  @Column
  email!: string;

  @Column
  name!: string;

  @Column
  address1!: string;

  @Column
  address2!: string;

  @Column
  city!: string;

  @Column
  state!: string;

  @Column
  zip!: string;

  @Column
  country!: string;

  // Helper methods
  isExpired() {
    return this.expires.getTime() <= Date.now();
  }

  serialize() {
    const json = this.toJSON();
    delete json.deletedAt;
    delete json.updatedAt;
    delete json.addIndex;
    return json;
  }

  static async getActiveOrderForPubkey(pubkey: string) {
    return Order.findOne({
      where: {
        pubkey,
        [Op.or]: {
          expires: {
            [Op.gt]: new Date(),
          },
          hasPaid: true,
        }
      },
    });
  }

  static async getStock() {
    // Initialize stocks. Copy paste instead of loop for easier TS typing.
    interface StockInfo {
      total: number;
      available: number;
      pending: boolean;
    }
    const stocks: { [key in SIZE]: StockInfo } = {
      [SIZE.S]: {
        total: env.SHIRT_STOCK[SIZE.S],
        available: env.SHIRT_STOCK[SIZE.S],
        pending: false,
      },
      [SIZE.M]: {
        total: env.SHIRT_STOCK[SIZE.M],
        available: env.SHIRT_STOCK[SIZE.M],
        pending: false,
      },
      [SIZE.L]: {
        total: env.SHIRT_STOCK[SIZE.L],
        available: env.SHIRT_STOCK[SIZE.L],
        pending: false,
      },
      [SIZE.XL]: {
        total: env.SHIRT_STOCK[SIZE.XL],
        available: env.SHIRT_STOCK[SIZE.XL],
        pending: false,
      },
    };

    // Reduce stock for each order. If it's pending, mark pending.
    const orders = await Order.findAll({
      where: {
        [Op.or]: {
          expires: {
            [Op.gt]: new Date(),
          },
          hasPaid: true,
        },
      },
    });
    orders.forEach(o => {
      const size = o.size as SIZE;
      stocks[size].available = stocks[size].available - 1;
      stocks[size].pending = stocks[size].pending || !o.hasPaid;
    });

    return stocks;
  }
}

export default Order;
