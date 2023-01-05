import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserOrderEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public originalId: string;

  @Column()
  public status: 'success' | 'process';
}
