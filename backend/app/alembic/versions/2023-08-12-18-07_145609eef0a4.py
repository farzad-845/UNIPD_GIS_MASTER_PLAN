"""empty message

Revision ID: 145609eef0a4
Revises: 866e08f27434
Create Date: 2023-08-12 18:07:57.958677

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy_utils
import sqlmodel # added


# revision identifiers, used by Alembic.
revision = '145609eef0a4'
down_revision = '866e08f27434'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm") 
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('Prg', 'frazione',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('Prg', 'frazione',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###
