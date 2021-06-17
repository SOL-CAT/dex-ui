import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Image, Popover, Row, Select, Typography } from 'antd';
import styled from 'styled-components';
import Orderbook from '../components/Orderbook';
import UserInfoTable from '../components/UserInfoTable';
import StandaloneBalancesDisplay from '../components/StandaloneBalancesDisplay';
import {
  getMarketInfos,
  getTradePageUrl,
  MarketProvider,
  useMarket,
  useMarketsList,
  useUnmigratedDeprecatedMarkets,
} from '../utils/markets';
import TradeForm from '../components/TradeForm';
import TradesTable from '../components/TradesTable';
import LinkAddress from '../components/LinkAddress';
import DeprecatedMarketsInstructions from '../components/DeprecatedMarketsInstructions';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import CustomMarketDialog from '../components/CustomMarketDialog';
import { notify } from '../utils/notifications';
import { useHistory, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import {TVChartContainer} from '../components/TradingView';
import marketDataInfo from '../data.json';
import ETH from '../assets/ETH.png';
import BTC from '../assets/BTC.png';
import CATO from '../assets/CATO.jpg';
import BOP from '../assets/BOP.png';
import CHEEMS from '../assets/CHEEMS.png';
import COPE from '../assets/COPE.jpg';
import CREAM from '../assets/CREAM.png';
import DOGA from '../assets/DOGA.png';
import FAB from '../assets/FAB.png';
import FIDA from '../assets/FIDA.svg';
import FROG from '../assets/FROG.jpeg';
import FRONT from '../assets/FRONT.png';
import FTR from '../assets/FTR.png';
import FTT from '../assets/FTT.png';
import HGET from '../assets/HGET.svg';
import HNT from '../assets/HNT.webp';
import HOLD from '../assets/HOLD.png';
import HXRO from '../assets/HXRO.webp';
import JOKE from '../assets/JOKE.png';
import KEEP from '../assets/KEEP.webp';
import KEKW from '../assets/KEKW.png';
import KIN from '../assets/KIN.png';
import LINK from '../assets/LINK.png';
import LUA from '../assets/LUA.png';
import MAPS from '../assets/MAPS.svg';
import MEDIA from '../assets/MEDIA.png';
import MER from '../assets/MER.svg';
import MOLA from '../assets/MOLA.jpg';
import MSRM from '../assets/MSRM.png';
import NINJA from '../assets/NINJA.svg';
import OXY from '../assets/OXY.svg';
import PGN from '../assets/PGN.png';
import POTATO from '../assets/POTATO.jpg';
import RAY from '../assets/RAY.png';
import ROPE from '../assets/ROPE.svg';
import SAIL from '../assets/SAIL.png';
import SAMO from '../assets/SAMO.png';
import SDOGE from '../assets/SDOGE.jpg';
import SLDN from '../assets/SLNDN.png';
import SOLAPE from '../assets/SOLAPE.png';
import SRM from '../assets/MSRM.png';
import SOL from '../assets/SOL.png';
import STNK from '../assets/STNK.png';
import SUSHI from '../assets/SUSHI.png';
import TULIP from '../assets/TULIP.svg';
import USDC from '../assets/USDC.png';
import WOOF from '../assets/WOOF.png';
import mBRZ from '../assets/mBRZ.png';
import MEOW from '../assets/sCAT.jpg';
import xCOPE from '../assets/COPE.jpg';
import PARTI from '../assets/PARTI.png';

const mockdict = {
  ETH: ETH,
  BTC: BTC,
  CATO: CATO,
  BOP: BOP,
  CHEEMS: CHEEMS,
  COPE: COPE,
  CREAM: CREAM,
  DOGA: DOGA,
  FAB: FAB,
  FIDA: FIDA,
  FROG: FROG,
  FRONT: FRONT,
  FTR: FTR,
  FTT: FTT,
  HGET: HGET,
  HNT: HNT,
  HOLD: HOLD,
  HXRO: HXRO,
  JOKE: JOKE,
  KEEP: KEEP,
  KEKW: KEKW,
  KIN: KIN,
  LINK: LINK,
  LUA: LUA,
  MAPS: MAPS,
  MEDIA: MEDIA,
  MER: MER,
  MOLA: MOLA,
  MSRM: MSRM,
  NINJA: NINJA,
  OXY: OXY,
  PGN: PGN,
  POTATO: POTATO,
  RAY: RAY,
  ROPE: ROPE,
  SAIL: SAIL,
  SAMO: SAMO,
  SDOGE: SDOGE,
  SLNDN: SLDN,
  SOLAPE: SOLAPE,
  SRM: SRM,
  SOL: SOL,
  STNK: STNK,
  SUSHI: SUSHI,
  TULIP: TULIP,
  USDC: USDC,
  WOOF: WOOF,
  mBRZ: mBRZ,
  MEOW: MEOW,
  xCOPE: xCOPE,
  PARTI: PARTI,
};
const { Option, OptGroup } = Select;

const Wrapper = styled.div`
  height: 100%;
  flex-direction: column;
  padding: 16px 16px;
  .borderNone .ant-select-selector {
    border: none !important;
  }
`;

export default function TradePage() {
  const { marketAddress } = useParams();
  useEffect(() => {
    if (marketAddress) {
      localStorage.setItem('marketAddress', JSON.stringify(marketAddress));
    }
  }, [marketAddress]);
  const history = useHistory();
  function setMarketAddress(address) {
    history.push(getTradePageUrl(address));
  }

  return (
    <MarketProvider
      marketAddress={marketAddress}
      setMarketAddress={setMarketAddress}
    >
      <TradePageInner />
    </MarketProvider>
  );
}

function TradePageInner() {
  const {
    market,
    marketName,
    customMarkets,
    setCustomMarkets,
    setMarketAddress,
  } = useMarket();
  const markets = useMarketsList();
  const [handleDeprecated, setHandleDeprecated] = useState(false);
  const [addMarketVisible, setAddMarketVisible] = useState(false);
  const deprecatedMarkets = useUnmigratedDeprecatedMarkets();
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    document.title = marketName ? `${marketName} — CATO Dex` : 'CATO Dex';
  }, [marketName]);

  const changeOrderRef = useRef<
    ({ size, price }: { size?: number; price?: number }) => void
  >();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = dimensions?.width;
  const componentProps = {
    onChangeOrderRef: (ref) => (changeOrderRef.current = ref),
    onPrice: useCallback(
      (price) => changeOrderRef.current && changeOrderRef.current({ price }),
      [],
    ),
    onSize: useCallback(
      (size) => changeOrderRef.current && changeOrderRef.current({ size }),
      [],
    ),
  };
  const component = (() => {
    if (handleDeprecated) {
      return (
        <DeprecatedMarketsPage
          switchToLiveMarkets={() => setHandleDeprecated(false)}
        />
      );
    } else if (width < 1000) {
      return <RenderSmaller {...componentProps} marketN={marketName}/>;
    } else if (width < 1450) {
      return <RenderSmall {...componentProps} marketN={marketName} />;
    } else {
      return <RenderNormal {...componentProps} marketN={marketName} />;
    }
  })();

  const onAddCustomMarket = (customMarket) => {
    const marketInfo = getMarketInfos(customMarkets).some(
      (m) => m.address.toBase58() === customMarket.address,
    );
    if (marketInfo) {
      notify({
        message: `A market with the given ID already exists`,
        type: 'error',
      });
      return;
    }
    const newCustomMarkets = [...customMarkets, customMarket];
    setCustomMarkets(newCustomMarkets);
    setMarketAddress(customMarket.address);
  };

  const onDeleteCustomMarket = (address) => {
    const newCustomMarkets = customMarkets.filter((m) => m.address !== address);
    setCustomMarkets(newCustomMarkets);
  };

  return (
    <>
      <CustomMarketDialog
        visible={addMarketVisible}
        onClose={() => setAddMarketVisible(false)}
        onAddCustomMarket={onAddCustomMarket}
      />
      <Wrapper>
        <Row
          align="middle"
          style={{ paddingLeft: 5, paddingRight: 5 }}
          gutter={16}
        >
          <Col>
            <MarketSelector
              markets={markets}
              setHandleDeprecated={setHandleDeprecated}
              placeholder={'Select market'}
              customMarkets={customMarkets}
              onDeleteCustomMarket={onDeleteCustomMarket}
            />
          </Col>
          {market ? (
            <Col>
              <Popover
                content={<LinkAddress address={market.publicKey.toBase58()} />}
                placement="bottomRight"
                title="Market address"
                trigger="click"
              >
                <InfoCircleOutlined style={{ color: '#FFA910' }} />
              </Popover>
            </Col>
          ) : null}
          <Col>
            <PlusCircleOutlined
              style={{ color: '#FFA910' }}
              onClick={() => setAddMarketVisible(true)}
            />
          </Col>
          {deprecatedMarkets && deprecatedMarkets.length > 0 && (
            <React.Fragment>
              <Col>
                <Typography>
                  You have unsettled funds on old markets! Please go through
                  them to claim your funds.
                </Typography>
              </Col>
              <Col>
                <Button onClick={() => setHandleDeprecated(!handleDeprecated)}>
                  {handleDeprecated ? 'View new markets' : 'Handle old markets'}
                </Button>
              </Col>
            </React.Fragment>
          )}
        </Row>
        {component}
      </Wrapper>
    </>
  );
}

function MarketSelector({
  markets,
  placeholder,
  setHandleDeprecated,
  customMarkets,
  onDeleteCustomMarket,
}) {
  const { market, setMarketAddress } = useMarket();

  const onSetMarketAddress = (marketAddress) => {
    setHandleDeprecated(false);
    setMarketAddress(marketAddress);
  };

  const extractBase = (a) => a.split('/')[0];
  const extractQuote = (a) => a.split('/')[1];

  const selectedMarket = getMarketInfos(customMarkets)
    .find(
      (proposedMarket) =>
        market?.address && proposedMarket.address.equals(market.address),
    )
    ?.address?.toBase58();

  return (
    <Select
      showSearch
      size={'large'}
      style={{ width: 200 }}
      placeholder={placeholder || 'Select a market'}
      optionFilterProp="name"
      onSelect={onSetMarketAddress}
      listHeight={400}
      value={selectedMarket}
      filterOption={(input, option) =>
        option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {customMarkets && customMarkets.length > 0 && (
        <OptGroup label="Custom">
          {customMarkets.map(({ address, name }, i) => (
            <Option
              value={address}
              key={nanoid()}
              name={name}
              style={{
                padding: '10px',
                // @ts-ignore
                backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
              }}
            >
              <Row>
                <Col flex="auto">{name}</Col>
                {selectedMarket !== address && (
                  <Col>
                    <DeleteOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        onDeleteCustomMarket && onDeleteCustomMarket(address);
                      }}
                    />
                  </Col>
                )}
              </Row>
            </Option>
          ))}
        </OptGroup>
      )}
      <OptGroup label="Markets">
        {markets
          .sort((a, b) =>
            extractQuote(a.name) === 'USDT' && extractQuote(b.name) !== 'USDT'
              ? -1
              : extractQuote(a.name) !== 'USDT' &&
                extractQuote(b.name) === 'USDT'
              ? 1
              : 0,
          )
          .sort((a, b) =>
            extractBase(a.name) < extractBase(b.name)
              ? -1
              : extractBase(a.name) > extractBase(b.name)
              ? 1
              : 0,
          )
          .map(({ address, name, deprecated }, i) => (
            <Option
              value={address.toBase58()}
              key={nanoid()}
              name={name}
              style={{
                padding: '10px',
                // @ts-ignore
                backgroundColor: i % 2 === 0 ? 'rgb(39, 44, 61)' : null,
              }}
            >
              {name} {deprecated ? ' (Deprecated)' : null}
            </Option>
          ))}
      </OptGroup>
    </Select>
  );
}

const DeprecatedMarketsPage = ({ switchToLiveMarkets }) => {
  return (
    <>
      <Row>
        <Col flex="auto">
          <DeprecatedMarketsInstructions
            switchToLiveMarkets={switchToLiveMarkets}
          />
        </Col>
      </Row>
    </>
  );
};

const RenderNormal = ({ onChangeOrderRef, onPrice, onSize, marketN }) => {
  let radius = {borderRadius: "15px"};
  return (
    <Wrapper>
        <Banner marketName={marketN}></Banner>
    <Row
      style={{
        height: '1100px',
        flexWrap: 'nowrap',
      }}
    >
      <Col flex="auto" style={{ display: 'flex', flexDirection: 'column' }}>
       
      <Row style = {{minHeight: '600px', flexWrap: 'nowrap'}}><TVChartContainer  /></Row>
      <Row><StandaloneBalancesDisplay /></Row>

      </Col>
      <Col
        flex="400px"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <TradeForm style = {radius} setChangeOrderRef={onChangeOrderRef} />
        <Orderbook smallScreen={false} onPrice={onPrice} onSize={onSize} />
        
        <TradesTable smallScreen={false} />
       
      </Col>
      
      <Col>
      
      </Col>
    </Row>
    <Row style = {{marginTop:"50px", minHeight: '250px', flexWrap: 'nowrap'}}><UserInfoTable /></Row>
      
      </Wrapper>
  );
};

const RenderSmall = ({ onChangeOrderRef, onPrice, onSize, marketN }) => {
  return (
    <>
     <Row style = {{height: '300px', flexWrap: 'nowrap'}}><TVChartContainer  /></Row>
      <Row
        style={{
          height: '900px',
        }}
      >
        <Col flex="auto" style={{ height: '100%', display: 'flex' }}>
          <Orderbook
            smallScreen={true}
            depth={13}
            onPrice={onPrice}
            onSize={onSize}
          />
        </Col>
        <Col flex="auto" style={{ height: '100%', display: 'flex' }}>
          <TradesTable smallScreen={true} />
        </Col>
        <Col
          flex="400px"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <TradeForm setChangeOrderRef={onChangeOrderRef} />
          <StandaloneBalancesDisplay />
        </Col>
      </Row>
      <Row>
        <Col flex="auto">
          <UserInfoTable />
        </Col>
      </Row>
    </>
  );
};

const RenderSmaller = ({ onChangeOrderRef, onPrice, onSize, marketN }) => {
  return (
    <>
    <Row style = {{height: '500px', flexWrap: 'nowrap'}}><TVChartContainer  /></Row>

      <Row>
        <Col xs={24} sm={12} style={{ height: '100%', display: 'flex' }}>
          <TradeForm style={{ flex: 1 }} setChangeOrderRef={onChangeOrderRef} />
        </Col>
        <Col xs={24} sm={12}>
          <StandaloneBalancesDisplay />
        </Col>
      </Row>
      <Row
        style={{
          height: '500px',
        }}
      >
        <Col xs={24} sm={12} style={{ height: '100%', display: 'flex' }}>
          <Orderbook smallScreen={true} onPrice={onPrice} onSize={onSize} />
        </Col>
        <Col xs={24} sm={12} style={{ height: '100%', display: 'flex' }}>
          <TradesTable smallScreen={true} />
        </Col>
      </Row>
      <Row>
        <Col flex="auto">
          <UserInfoTable />
        </Col>
      </Row>
    </>
  );
};

const Banner = ({marketName}) =>{
  let supply="", typeOfToken="", website="";
  for (var i=0; i<marketDataInfo.length; i++){
    if (marketDataInfo[i].name===marketName){
      supply = marketDataInfo[i].supply;
      typeOfToken = marketDataInfo[i].type;
      website = marketDataInfo[i].website;
      break;
    }

  }
  let logoUrl = marketName ? marketName.split('/')[0] : null;
  let type = "High Risk";
  let riskStyle ={color: "white", verticalAlign: "top", marginLeft: "20px", fontSize: "22px"};
  let titleSpan = <span style={{verticalAlign:"middle"}}><Image style={{top:"10px"}} height='75px' width='75px' src={mockdict[logoUrl]}/><span style={riskStyle}>{marketName}<span style = {{fontSize:"12px", marginLeft:"10px"}}>{typeOfToken}</span></span></span>
  return(
    <Row style={{height: '220px', flexWrap: 'nowrap', marginBottom: "50px"}}>
        <Card bordered={false} style = {{height: '100%', width: '100%', background: "#313131", borderRadius:"15px  "}} title = {titleSpan }>
          <Row style ={{height:"100%"}}>
            <Col style = {{textAlign: "left", width: "50%"}}>
            Supply
            </Col>
            <Col style = {{textAlign: "right", width: "50%"}}>
            {supply}
            </Col>
          </Row>
          <Row style ={{height:"100%"}}>
            <Col style = {{textAlign: "left", width: "50%"}}>
            Website
            </Col>
            <Col style = {{textAlign: "right", width: "50%"}}>
            <a href = {website}>{website}</a>
            </Col>
          </Row>
          
        </Card>
        
    </Row>)
};