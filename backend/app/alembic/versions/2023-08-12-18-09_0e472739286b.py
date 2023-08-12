"""empty message

Revision ID: 0e472739286b
Revises: 145609eef0a4
Create Date: 2023-08-12 18:09:23.896462

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy_utils
import sqlmodel # added


# revision identifiers, used by Alembic.
revision = '0e472739286b'
down_revision = '145609eef0a4'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm") 
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('Prg', 'articolo',
               existing_type=sa.VARCHAR(),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('Prg', 'articolo',
               existing_type=sa.VARCHAR(),
               nullable=False)
    # ### end Alembic commands ###
