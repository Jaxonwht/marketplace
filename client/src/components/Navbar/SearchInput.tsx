import { ReactNode, useEffect, useState } from "react";
import { Descriptions, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type Fuse from "fuse.js";
import type { DealInfo } from "../../backendTypes";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fuzzySearchFuse } from "../../selectors/dealInfo";
import styles from "./index.module.scss";
import { fetchAllDealInfo } from "../../reduxSlices/dealInfoSlice";
import { useNavigate } from "react-router-dom";
import GeneratedImage from "../generated_image/GeneratedImage";
import { highlightPartOfText } from "../../utils/string";

interface SearchInputProps {
  selectPlaceHolder?: ReactNode;
  selectStyle?: React.CSSProperties;
}

const SearchInput = ({ selectStyle, selectPlaceHolder }: SearchInputProps) => {
  const [results, setResults] = useState<Fuse.FuseResult<DealInfo>[]>([]);
  const { Option } = Select;
  const fuse = useAppSelector(fuzzySearchFuse);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchAllDealInfo);
  }, [dispatch]);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    if (!!value) {
      const searchResults = fuse.search(value);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const [showingDetail, setShowingDetail] = useState<number | undefined>();

  const options = results.map((result, index) => (
    <Option key={result.item.serial_id}>
      <div
        onMouseEnter={() => setShowingDetail(result.item.serial_id)}
        onMouseLeave={() => setShowingDetail(undefined)}
      >
        <Descriptions
          column={1}
          size="small"
          title={
            <span>
              <GeneratedImage
                generateSource={result.item.serial_id}
                generateSize={30}
              />{" "}
              Deal {result.item.serial_id}
            </span>
          }
        >
          {((showingDetail === undefined && index === 0) ||
            showingDetail === result.item.serial_id) &&
            result.matches?.map((match) => {
              const { indices, key, value } = match;
              return (
                <Descriptions.Item key={key} label={key}>
                  {value && highlightPartOfText(value, indices)}
                </Descriptions.Item>
              );
            })}
        </Descriptions>
      </div>
    </Option>
  ));

  const selectDeal = (serialId: string) => {
    navigate(`/nftdetail/${serialId}`);
  };

  return (
    <Select
      className={styles["search-input"]}
      showSearch
      dropdownMatchSelectWidth={550}
      placeholder={selectPlaceHolder}
      style={selectStyle}
      defaultActiveFirstOption={false}
      showArrow={true}
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={null}
      suffixIcon={<SearchOutlined />}
      onSelect={selectDeal}
      listHeight={400}
    >
      {options}
    </Select>
  );
};

export default SearchInput;
