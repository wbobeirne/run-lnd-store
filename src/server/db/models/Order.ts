import { Table, Column, Model } from 'sequelize-typescript';
import { SIZE } from '../../constants';
import env from '../../env';

@Table({ timestamps: true, paranoid: true })
export class Order extends Model<Order> {
  // Lightning invoice info (All required)
  @Column({ allowNull: false, unique: true })
  pubkey!: string;

  @Column({ allowNull: false })
  paymentRequest!: string;

  @Column({ allowNull: false })
  preimage!: string;

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
  isPending() {
    return !this.email;
  }

  // Static functions
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
    const orders = await Order.findAll();
    orders.forEach(o => {
      const size = o.size as SIZE;
      stocks[size].available = stocks[size].available - 1;
      stocks[size].pending = stocks[size].pending || o.isPending();
    });

    return stocks;
  }
}

export default Order;
