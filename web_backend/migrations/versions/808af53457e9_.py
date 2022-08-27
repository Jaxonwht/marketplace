"""Change the structure of ownership and deal

Revision ID: 808af53457e9
Revises: 5930943b5645
Create Date: 2022-08-26 18:11:46.787154

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "808af53457e9"
down_revision = "5930943b5645"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("deal", "open_asset_price")
    op.add_column("ownership", sa.Column("closed", sa.Boolean(), nullable=False))
    op.add_column("ownership", sa.Column("close_transaction_serial_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_ownership_closed"), "ownership", ["closed"], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_ownership_closed"), table_name="ownership")
    op.drop_column("ownership", "close_transaction_serial_id")
    op.drop_column("ownership", "closed")
    op.add_column(
        "deal",
        sa.Column("open_asset_price", postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    )
    # ### end Alembic commands ###