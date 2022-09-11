export const openseaCollectionLink = (
  collectionName: string,
  displayString: string = collectionName
) => (
  <a
    target="_blank"
    rel="noreferrer"
    href={`https://opensea.io/collection/${collectionName}`}
  >
    {displayString}
  </a>
);

export const openseaAssetLink = (
  collectionAddress: string,
  assetId: string | number,
  displayString: string = String(assetId)
) => (
  <a
    target="_blank"
    rel="noreferrer"
    href={`https://opensea.io/assets/ethereum/${collectionAddress}/${assetId}`}
  >
    {displayString}
  </a>
);

export const goerliScanLink = (
  address: string,
  displayString: string = address
) => (
  <a
    target="_blank"
    rel="noreferrer"
    href={`https://goerli.etherscan.io/address/${address}`}
  >
    {displayString}
  </a>
);
