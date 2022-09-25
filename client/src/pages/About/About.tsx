import styles from "./style.module.css";
import GeneratedImage from "../../components/generated_image/GeneratedImage";
import { Dropdown, Select, Avatar, Typography } from "antd";

export default function Home() {
  const featuredUsers = ["NNFF1", "NNFF2", "NNFF3", "NNFF4", "NNFF5"];
  const { Text } = Typography;

  return (
    <div className={styles.home}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.homeTopCaption}>
            <Text>What is AISSI?</Text>
          </div>
          <p className={styles.topDesc}>
            <Text>
              Aissi platform enables users to invest any blue chip Nft projects
              with USDT while guarantees liquidity. We provide two products:
              first is NFT spot contract where users can either pledge their NFT
              in our liquidity pool or buy NFT shares from the pool. The second
              is our NFT index perpetual, which we use a basket of NFT projects
              to make this index.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              Users can use USDT to invest any single blue chip NFT project.
              Nfts pledged in the liquidity pool will be divided into NFT shares
              and users may pay USDT to buy these shares, as we also call it NFT
              spot shares. NFT holders may also pledge their nfts into the
              liquidity pool to earn interest and maintain their NFT values.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              NFT index will be calculated based on the top 50 liquid nfts. We
              average their past 30 days average price, weighted with their
              trading volume and value.
            </Text>
          </p>
        </div>
        <div>
          <img
            style={{ width: 600, height: 600, objectFit: "contain" }}
            src={require("../../assets/images/nnf.jpg")}
            alt=""
          ></img>
        </div>
      </div>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div>
            <Text>How to join this game?</Text>
          </div>
          <p className={styles.topDesc}>
            <Text>
              Users may use u to invest in our products. Simply transfer u into
              aissi from their wallet and choose the product. Platform will
              calculate number of the spot share or perpetual according to their
              u amount.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              NFT holders can choose to provide liquidity for our NFT spot
              liquidity pool. Users can assess their NFT first, aissi will
              decide whether or not the price is acceptable, if not, aissi will
              provide an acceptable valuation. When pledgers agree on the price,
              the NFT will go into the pool, and pledgers can see their NFT
              values and percent of NFT shares sold, and start earning the
              interest. When the market price drops, pledgers will earn profit
              for those who purchases shares, and so to maintain their NFT
              values. Users may redeem NFT now and re-pledge it when market
              price reaches the next high point.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              As for NFT index perpetual, users use USDT to buy the perpetual
              and can trade in real time. The price of this index fluctuates
              24/7. All the profit and loss are calculated based on index price
              and are settled in USDT. Users may buy long or short for this
              perpetual.
            </Text>
          </p>
        </div>
      </div>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div>
            <Text>What makes AISSI different?</Text>
          </div>
          <p className={styles.topDesc}>
            <Text>
              1· NFT investment process simplified. No more project skimming,
              rules reading, and community following. Only blue chip projects
              are included in our pool. Join any blue chip NFT game simply with
              stablecoins in hand.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              2· For NFT spot contract, we don’t actually fractionalize NFTs. We
              just add the value of NFT pledged to the liquidity pool and split
              the value into shares.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              3· Stablecoins enabled for payment and returns. Compare to most
              platforms that use Ethereum, this will be more liquid and
              convenient.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              4· Compared to other NFT fractional platforms, NFT pledgers don’t
              need to transfer NFT into ERC720 tokens. They simply pledge their
              NFT in our pool. When market goes down, their NFT will remain at
              the same value. While maintaining their NFT values, they also
              receive interest for providing liquidity.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              5· NFT index perpetual is stabler than single NFT perpetual. It
              prevents the huge price difference between perpetual price and
              actual project price.
            </Text>
          </p>
          <p className={styles.topDesc}>
            <Text>
              6· Index perpetual provides a stable short selling tool for the
              market.
            </Text>
          </p>
        </div>
      </div>
      <div className={styles.list}>
        {featuredUsers.map((user) => (
          <div className={styles.listItem}>
            <GeneratedImage
              generateSource={user}
              generateSize={120}
              alt={user}
            />
            <div className={styles.listItemImage}>{user}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
