import { Descriptions, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ReactNode, useEffect, useState } from "react";
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
  const [value, setValue] = useState<string>("");
  const { Option } = Select;
  const fuse = useAppSelector(fuzzySearchFuse);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchAllDealInfo);
  }, [dispatch]);
  const navigate = useNavigate();

  const handleSearch = (newValue: string) => {
    if (!!newValue) {
      const searchResults = fuse.search(newValue);
      const result = searchResults[0];
      setResults(
        new Array(10)
          .fill(searchResults)
          .flat(1)
          .map((result, index) => ({
            ...result,
            item: { ...result.item, serial_id: index },
          }))
      );
    } else {
      setResults([]);
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const [willShowDetail, setWillShowDetail] = useState<Record<number, boolean>>(
    {}
  );
  const handleMouseEnterResult = (serialId: number) =>
    setWillShowDetail((prevState) => ({ ...prevState, [serialId]: true }));
  const handleMouseLeaveResult = (serialId: number) =>
    setWillShowDetail((prevState) => ({ ...prevState, [serialId]: false }));

  const options = results.map((result, index) => (
    <Option key={result.item.serial_id}>
      <div
        onMouseEnter={() => handleMouseEnterResult(result.item.serial_id)}
        onMouseLeave={() => handleMouseLeaveResult(result.item.serial_id)}
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
          {(index === 0 || !!willShowDetail[result.item.serial_id]) &&
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
    setValue("");
    navigate(`/nnfdetail/${serialId}`);
  };

  // TODO Use something other than this shitty shitty Select
  return (
    <Select
      className={styles["search-input"]}
      showSearch
      dropdownMatchSelectWidth={550}
      value={value}
      placeholder={selectPlaceHolder}
      style={selectStyle}
      defaultActiveFirstOption={false}
      showArrow={true}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
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
