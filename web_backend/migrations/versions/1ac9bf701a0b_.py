"""Make collection name non-nullable

Revision ID: 1ac9bf701a0b
Revises: 808af53457e9
Create Date: 2022-09-11 17:00:48.927281

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "1ac9bf701a0b"
down_revision = "808af53457e9"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("deal", "collection_name", existing_type=sa.VARCHAR(), nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("deal", "collection_name", existing_type=sa.VARCHAR(), nullable=True)
    # ### end Alembic commands ###
