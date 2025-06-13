import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumn1749831325447 implements MigrationInterface {
  name = 'AddNewColumn1749831325447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "newColumn" integer NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "newColumn"`,
    );
  }
}
