"""Add indices to columns that are filters for periodic jobs

Revision ID: 4bb8601aedf7
Revises: b844a5e1aeff
Create Date: 2022-07-24 17:21:05.403764

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "4bb8601aedf7"
down_revision = "b844a5e1aeff"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index(op.f("ix_deal_closed"), "deal", ["closed"], unique=False)
    op.create_index(op.f("ix_deal_end_time"), "deal", ["end_time"], unique=False)
    op.create_index(op.f("ix_deal_start_time"), "deal", ["start_time"], unique=False)
    op.add_column("platform_transaction", sa.Column("status", sa.String(), nullable=False))
    op.create_index(op.f("ix_platform_transaction_status"), "platform_transaction", ["status"], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_platform_transaction_status"), table_name="platform_transaction")
    op.drop_column("platform_transaction", "status")
    op.drop_index(op.f("ix_deal_start_time"), table_name="deal")
    op.drop_index(op.f("ix_deal_end_time"), table_name="deal")
    op.drop_index(op.f("ix_deal_closed"), table_name="deal")
    # ### end Alembic commands ###
