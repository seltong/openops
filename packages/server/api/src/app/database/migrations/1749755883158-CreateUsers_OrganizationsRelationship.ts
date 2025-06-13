import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersOrganizationsRelationship1749755883158
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users_organizations',
        columns: [
          {
            name: 'organization_id',
            type: 'character varying(21)',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'character varying(21)',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['organization_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'organization',
          },
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      new Table({
        name: 'users_organizations',
        columns: [
          {
            name: 'organization_id',
            type: 'string',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'string',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['organization_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'organization',
          },
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
          },
        ],
      }),
    );
  }
}
