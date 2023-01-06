import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBalanceEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public userId: number;

  @Column({ unique: true })
  public originalId: string;

  @Column()
  public status: 'success' | 'process';

  @Column()
  public amount: string;
}
