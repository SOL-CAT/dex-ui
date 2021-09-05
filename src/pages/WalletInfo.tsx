import React, { useState, useEffect } from 'react';
import './walletInfo.css';
import { useWallet } from '../utils/wallet';
import merge from 'merge';
import { Layout, Menu, Col, Row, Divider, Card, Table } from 'antd';
import { Connection, PublicKey } from '@solana/web3.js';
import _ from "lodash";
import moment from "moment";
import details from "./logoInfo.json";
import allTokens from "./tokenInfoBackup.json";
import { LaptopOutlined, DashboardOutlined, LoadingOutlined, SwapOutlined, FileImageOutlined} from '@ant-design/icons';
const { Content,  Sider } = Layout;
const { Meta } = Card;
var ReactHighcharts = require('react-highcharts');

const programId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const PROGRAM_ID = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
);
const solanaUrl = "https://api.mainnet-beta.solana.com/";
const orangeShade = "#CBCAC8";
const serverUrl = "http://31.220.52.230";
const columns = [
  {
    title: <strong>Signature</strong>,
    dataIndex: "signature",
    key: "signature",
    render: (text, record) => {
      return <a title= {"Go to Solscan"} target="_blank" rel="noopener noreferrer" href={"https://solscan.io/tx/" +text}>{record.signature}</a>
    },
    ellipsis: true
  },
  {
    title: "From",
    dataIndex: "from",
    key: "from",
    ellipsis: true,
    render: (text, record) => {
      return <div title= {"Click to Copy: " + text} style={{cursor: "pointer"}} onClick={() => {navigator.clipboard.writeText(text);}}>{text.substring(0,10)+"..."}</div>
    }
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (text, record) => {
      let color = text === "Send" ? "red" : "green";
      return <div style={{color:color}}>{text}</div>
    }
  },
  {
    title: "To",
    dataIndex: "to",
    key: "to",
    ellipsis: true,
    render: (text, record) => {
      return <div title= {"Click to Copy: " + text} style={{cursor: "pointer"}} onClick={() => {navigator.clipboard.writeText(text);}}>{text.substring(0,10)+"..."}</div>
    }
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    ellipsis: true
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    ellipsis: true
  },
  {
    title: "Asset",
    dataIndex: "tokenName",
    key: "tokenName"
  },
  {
    title: "Mint",
    dataIndex: "mint",
    key: "mint",
    render: (text, record) => {
      let logoUrl = ""
      for (var i=0; i<details.length; i++){
        if (details[i].token_address === text)
          logoUrl = details[i].token_logo
      }
      return <div>
        <img title= {"Click to Copy: " + text} onClick={() => {navigator.clipboard.writeText(text);}} style={{cursor: "pointer"}}
         alt="" height="30px" width="30px" src={logoUrl}/>
      </div>
    },
  }
];

export default function BalancesPage() {
  const { connected, wallet } = useWallet();
  const [userTokens, setUserTokens] = useState([{
    tokenName: "Overall",
    effectiveMint: "All",
    amount: 0,
    marketAddress: "",
    disabled: false
  }]);
  const [tokenGraphDetails, setTokenGraphDetails] = useState([]);
  const [activeMenuKey, setActiveMenuKey] = useState("All");
  const [netWorth, setNetWorth] = useState("");
  const [pnl, setpnl] = useState([]);
  const [yesterdayPnl, setYesterdayPnl] = useState(0);
  const [apiResponse, setApiResponse] = useState({
    ownerAddress: null,
    data: null,
  });
  const [allTransactions, setTransactions] = useState({});
  const [mintTransactions, setMintTransactions] = useState({});
  const [tableDataSource, setTableData] = useState([]);
  let pieConfig = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
      backgroundColor: orangeShade,
      height: "150px",
      spacing: [5,5 , 5, 10]
    },
    tooltip: {
      pointFormat: '{point.percentage:.1f}%: <b> ({point.y}$)</b>',
    },
    accessibility: {
      point: {
        valueSuffix: '%',
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        showInLegend: false,
        dataLabels: {
          enabled: true,
        },
        //size: "220%"
      },
    },
    credits: {
      enabled: false
    },
    series: [],
  };
  let columnConfig = {
    chart: {
        type: 'column',
        backgroundColor: orangeShade,
        height: "150px"
    },
    title: {
        text: ''
    },
    xAxis: {
        crosshair: true,
        type: "datetime",
        title: {
          text: "",
          style: {
            color: "black"
          }
        },
        labels: {
          style: {
            color: "black"
          }
        }
    },
    yAxis: {
        title: {
            text: 'Profit ($)',
            style: {
              color: "black"
            }
        },
        labels: {
          style: {
            color: "black"
          }
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{point.color};padding:0">Change: </td>' +
           '<td style="padding:0"><b>  {point.y:.2f} $</b></td></tr>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    credits: {
      enabled: false
    },
    series: []

  };
  let lineConfig = {
    chart: {
        type: 'line',
        backgroundColor: orangeShade,
        height: "150px"
    },
    title: {
        text: ''
    },
    xAxis: {
        crosshair: true,
        type: "datetime",
        title: {
          text: "",
          style: {
            color: "black"
          }
        },
        labels: {
          style: {
            color: "black"
          }
        }
    },
    yAxis: {
        title: {
            text: 'Value ($)',
            style: {
              color: "black"
            }
        },
        labels: {
          style: {
            color: "black"
          }
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{point.color};padding:0">Value: </td>' +
           '<td style="padding:0"><b>  {point.y:.2f}$</b></td></tr>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
        },
    },
    credits: {
      enabled: false
    },
    series: []

  };

  const convertDateToMs = (fulldateInString) => {
    let times = fulldateInString.substring(11, 19),
      ddd = new Date(fulldateInString.substring(6, 10), fulldateInString.substring(3, 5) - 1, fulldateInString.substring(0, 2), times.split(":")[0], times.split(":")[1], times.split(":")[2]);
      return ddd;
  }

  
  const lineChartDataFormat = () => {
    // @ts-ignore: Object is possibly 'null'.
    let apiResponseDataprofitLoss = pnl;
    let dataObject:any[] = [];
    let min =0;
    for (var i=0; i<apiResponseDataprofitLoss.length; i++){
      let dates = apiResponseDataprofitLoss[i].__time,
        dateInMs = convertDateToMs(dates)
      if (i ===0)
        min = dateInMs.getTime();
      dataObject.push(
        {
          x: dateInMs.getTime(),
          y: apiResponseDataprofitLoss[i].value,
          color: apiResponseDataprofitLoss[i].profit < 0 ? "red" : "green"
        }
      )
    }
    let dataConfig = merge.recursive(true, lineConfig, {
      series: [
        {
          name: "Portfolio value",
          color: "orange",
          showInLegend: false,
          data: dataObject,
        },
      ],
      xAxis: {
        startOnTick: true,
        min: min
      }
    });
    return dataConfig;

  };
  const columnChartDataFormat = () => {
    // @ts-ignore: Object is possibly 'null'.
    let apiResponseDataprofitLoss = pnl;
    let dataObject:any[] = [];
    let min =0;
    for (var i=0; i<apiResponseDataprofitLoss.length; i++){
      let dates = apiResponseDataprofitLoss[i].__time,
        dateInMs = convertDateToMs(dates)
      if (i ===0)
        min = dateInMs.getTime();
      dataObject.push(
        {
          x: dateInMs.getTime(),
          y: apiResponseDataprofitLoss[i].profit,
          color: apiResponseDataprofitLoss[i].profit < 0 ? "red" : "green"
        }
      )
    }
    let dataConfig = merge.recursive(true, columnConfig, {
      series: [
        {
          pointWidth: 15,
          name: "daily Change",
          showInLegend: false,
          data: dataObject,
        },
      ],
      xAxis: {
        startOnTick: true,
        min: min
      }
    });
    return dataConfig;
  };

  const pieChartDataFormat = () => {
    // @ts-ignore: Object is possibly 'null'.
    let apiResponseDataTokenDistribution = apiResponse.data.tokenDistribution;
    let dataObject: any[] = [];
    let tempNetWorth = 0;
    for (var i = 0; i < apiResponseDataTokenDistribution.balances.length; i++) {
      let value = parseFloat((
          apiResponseDataTokenDistribution.balances[i].price *
          apiResponseDataTokenDistribution.balances[i].amount
        ).toFixed(2));
      dataObject.push({
        name: apiResponseDataTokenDistribution.balances[i].tokenName,
        x: apiResponseDataTokenDistribution.balances[i].tokenName,
        y: value
      });
      tempNetWorth = tempNetWorth + value;
    }
    //setNetWorth(tempNetWorth);
    let dataConfig = merge.recursive(true, pieConfig, {
      series: [
        {
          data: dataObject,
        },
      ],
      title: {
        //text: 'Wallet Token Distribution as on ' + updatedTime,
        text: ""
      },
      legend: {
        enabled: true,
        symbolHeight: 12,
        align: "left",
        layout: dataObject.length < 5 ? "vertical": "horizontal",
        labelFormatter: function() {
          let name = (this as any).name;
          if (name)
            return "<div style='color:black; font-size: 12px'>" + name + "</div>"
          return "<div style='color:black'>Unknown</div>"
      },
      y: 10,
      x: -20
    }
    });
    return dataConfig;
  };
  const handleClick = (key) => {
    setActiveMenuKey(key);
  };

  const insertComma = (balance) => {
    return balance.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const chartCard = (selectedKey) => {
    let pnlChartConfig, valueLineChartConfig;
    if (selectedKey === "All"){
      pnlChartConfig = apiResponse.ownerAddress && columnChartDataFormat();
      valueLineChartConfig = apiResponse.ownerAddress && lineChartDataFormat();
    }
    else{
      let mintTokenData = tokenGraphDetails[activeMenuKey];
      pnlChartConfig = mintColumnChartDataFormat(mintTokenData);
      valueLineChartConfig = mintLineChartDataFormat(mintTokenData);
    }
    return <Layout >
      <Row align="middle" style = {{paddingBottom: "40px", paddingTop: "60px"}}>
        <Col>
          <div style={{fontSize: "19px"}}><strong>Assets Dashboard</strong></div>
        </Col>
      </Row>
      <Row align="middle" style = {{paddingBottom: "40px"}}  gutter={40} >
        <Col span={8}>
          {apiResponse.ownerAddress && pieChartCard()}
        </Col>
        <Col span={16}>
          {apiResponse.ownerAddress && pnlChartCard(pnlChartConfig)}
        </Col>
      </Row>
      <Row align="middle"  gutter={40} >
        <Col span={8}>
          {netWorthCard()}
        </Col>
        <Col span={16}>
          {apiResponse.ownerAddress ? valueLineChartCard(valueLineChartConfig) 
          : 
          <Card style={{borderRadius: "30px", height: "196px", color: "black", backgroundColor: orangeShade, fontSize: "16px", fontWeight: 800}}>
            <img height="150px" width="150px" src="https://cdn.discordapp.com/attachments/651333898734796821/883984805748957184/cato.png"
            alt="."/>Looks like you are first time user. Check us out in 24 hrs for Full portfolio analysis
          </Card>}
        </Col>
      </Row>
    </Layout>

  };
  const pnlChartCard = (dataConfig) => {
    return <Card style={{borderRadius: "30px", backgroundColor: orangeShade}}>
      <Row align="middle">
        <Col span={4}>
        <div style={{color: "black", fontSize: "18px"}}><strong>Daily P&L</strong></div>
        </Col>
        <Col span={20}>
        <ReactHighcharts config={dataConfig}></ReactHighcharts>
        </Col>
      </Row>
    </Card>
  };

  const valueLineChartCard = (dataConfig) => {
    return <Card style={{borderRadius: "30px", backgroundColor: orangeShade}}>
      <Row align="middle">
        <Col span={4}>
          <div style={{color: "black", fontSize: "18px"}}><strong>Asset Value</strong></div>
        </Col>
        <Col span={20}>
        <ReactHighcharts config={dataConfig}></ReactHighcharts>
        </Col>
      </Row>
    </Card>
  };

  const pieChartCard = () => {
    let dataConfigPie = pieChartDataFormat();
    return( 
    <Card style={{borderRadius: "30px", backgroundColor: orangeShade}}>
      <ReactHighcharts config={dataConfigPie}></ReactHighcharts>
    </Card>
    )
  };
  const netWorthCard = () => {
    let profitcssClass = yesterdayPnl > 0 ? "green" : yesterdayPnl !==0 ? "red": "black";
    let overallColor = "black";
    return <Card className="outerCard" style={{borderRadius: "30px", backgroundColor: orangeShade, height: "198px"}}>
      <Row align="bottom" style={{height: "50%"}}>
        <Col span={12} style={{textAlign: "center", fontSize:"18px"}}>
          <strong style={{color: overallColor}}>Networth</strong>
        </Col>
        <Col span={12} style={{textAlign: "center", fontSize:"18px"}}>
          <strong style={{color: overallColor}}> Yesterday's Profit</strong>
        </Col>
      </Row>
      <Row align="top" style={{height: "50%"}}>
        <Col span={12} style={{textAlign: "center", fontSize:"26px"}}>
          <strong style={{color: overallColor}}>{netWorth ? (netWorth + "$") : <LoadingOutlined />}</strong>
        </Col>
        <Col span={12} style={{textAlign: "center", fontSize:"26px"}}>
          <strong style={{color: profitcssClass}}>{yesterdayPnl ? (yesterdayPnl + "$") : apiResponse.ownerAddress ? <LoadingOutlined /> : "-"}</strong>
        </Col>
      </Row>
    </Card>

  };
  const siderProfileComponent = () => {
    return <div className="profileComponent">
      <Card
    style={{ width: "100%", background: "#313131" }}
    cover={<img alt="example" style={{borderRadius: "50%"}} src="https://lh3.googleusercontent.com/RkK6AZx8Vfn66Z2c4mhaBcBtipNZoguQwlGr8d9Jm_dObOTvCb0jfuqymuOVHgL50r2g33dcodUotFe4dx19ADypXkrq_ej-vLcctQ=w600" />}
    >
    <Meta title="Mrs Cat" description="Edit profile" />
      </Card>
      <Divider className="widthCustomDivider"/>
      <div style={{height: "20px"}}><strong>Net Worth:</strong></div>
      <div>{netWorth ? (netWorth + "$") : <LoadingOutlined />}</div>
      <Divider className="widthCustomDivider"/>
    </div>
  }

  const tokenAndPriceComponent = () => {
    return userTokens.map((item, index) => {
      const key = item.effectiveMint;
      let logoUrl = ""
      for (var i=0; i<details.length; i++){
        if (details[i].token_address === item.effectiveMint)
          logoUrl = details[i].token_logo
      }
      return <Menu.Item key={key} disabled={item.disabled} style={{height:"50px"}}>
        
        <Row title={item.disabled ? "No insights available for token added in the last 24hrs. Check back tomorrow!" : "View Insights"}>
          <Col span={12}>
            <img alt="" height="20px" width="20px" src={logoUrl}/>
          </Col>
          <Col span={12} style={{marginLeft: "-20px"}}>
          <Row justify="center" >
            <Col>
            <div style={{height: "20px", fontSize: "20px"}}><strong>{item.tokenName}</strong></div>
            </Col>
          </Row>
          <Row justify="center">
            <Col>
            <div>{item.amount}</div>
            </Col>

          </Row>
          </Col>
        </Row>
        
        
      </Menu.Item>;
    })
  };

  const siderComponent = () => {
    return <Sider style={{paddingTop: "50px", width: "20%"}}>
    <Menu style = {{textAlign: "center", height: "100%"}} theme="dark" mode="vertical" defaultSelectedKeys={[activeMenuKey]}
    onClick={(e) => 
      handleClick(e.key)}>
      <Menu.Item style={{textAlign: "left", fontSize: "16px"}} key={"All"} icon = {<DashboardOutlined/>}>{"Dashboard"}</Menu.Item>
      <Menu.Item style={{textAlign: "left", fontSize: "16px"}} key={"All2"} icon = {<SwapOutlined />} disabled={true}>{"Swap"}</Menu.Item>
      <Menu.Item style={{textAlign: "left", fontSize: "16px"}} key={"All3"}  icon = {<LaptopOutlined/>} disabled={true}>{"Yield Farming"}</Menu.Item>
      <Menu.Item style={{textAlign: "left", fontSize: "16px"}} key={"All4"} icon = {<FileImageOutlined />} disabled={true}>{"NFTs"}</Menu.Item>
      {siderProfileComponent()}
      {tokenAndPriceComponent()}
    </Menu>
    
  </Sider>;
  };

  async function getPrice(
    marketAddress,
    connection = new Connection(solanaUrl),
  ){
    if (marketAddress === "")
      return 0;
    marketAddress = new PublicKey(marketAddress);
    let price = 0;
    await fetch("https://api.dexlab.space/v1/prices/"+marketAddress+"/last")
    .then(result => result.json())
    .then(data => {
      price = data && data.data && data.data.price && parseFloat(data.data.price);
    });
    return price || 0;
  };

  const setAllTokensOwned = (solanaData, dbTokens) => {
    let finalArray = [];
    for (var i=0; i<solanaData.length; i++){
      let found = false;
      for (var j=0; j<dbTokens.length; j++){
        if (solanaData[i].account.data.parsed.info.mint === dbTokens[j].effectiveMint){
          found = true;
          let amount = parseFloat((solanaData[i].account.data.parsed.info.tokenAmount.uiAmount).toFixed(2));
          if (amount > 0)
          finalArray.push({
            effectiveMint: dbTokens[j].effectiveMint,
            tokenName: dbTokens[j].tokenName,
            marketAddress: dbTokens[j].marketAddress, 
            amount: amount,
            disabled: false
          });
          break;
        }
      }
      if (!found)
      {
        for (var k=0; k<allTokens.tokens.length; k++){
          if (solanaData[i].account.data.parsed.info.mint === allTokens.tokens[k].tokenMint){
            let amount = parseFloat((solanaData[i].account.data.parsed.info.tokenAmount.uiAmount).toFixed(2));
          if (amount > 0)
          finalArray.push({
            effectiveMint: allTokens.tokens[k].tokenMint,
            tokenName: allTokens.tokens[k].tokenName,
            marketAddress: allTokens.tokens[k].marketAddress, 
            amount: amount,
            disabled: true
          });
          }
        }
      }
    }
    return finalArray;
  };

  async function setYesterdayDetails(userTokensArray){
    let value = 0;
      for (var i=0; i<userTokensArray.length; i++){
        
        let price = await getPrice(userTokensArray[i].marketAddress);
        if (userTokensArray[i].tokenName === "USDC")
          price = 1;
        value = value + userTokensArray[i].amount * price;
      }
      let valueWithComma: string;
      if (value > 1000)
        valueWithComma = insertComma(value.toFixed(0));
      else
        valueWithComma = insertComma(value.toFixed(2));
      setNetWorth(valueWithComma);
  };

  const mintColumnChartDataFormat = (mintTokenData) => {
    let dataObject:any[] = [],
    min = 0;
    for (var i=0; i<mintTokenData.length; i++)
    {
      let dateInMs = convertDateToMs(mintTokenData[i].__time);
      if (i===0)
        min = dateInMs.getTime();
        dataObject.push(
          {
            x: dateInMs.getTime(),
            y: mintTokenData[i].profit,
            color: mintTokenData[i].profit < 0 ? "red" : "green"
          }
      )
    } 
    let dataConfig = merge.recursive(true, columnConfig, {
      series: [
        {
          pointWidth: 15,
          name: "daily Change",
          showInLegend: false,
          data: dataObject,
        },
      ],
      xAxis: {
        min: min
      }
    });
    return dataConfig;
  };
  const mintLineChartDataFormat = (mintTokenData) => {
    let dataObject:any[] = [],
    min = 0;
    for (var i=0; i<mintTokenData.length; i++)
    {
      let dateInMs = convertDateToMs(mintTokenData[i].__time);
      if (i===0)
        min = dateInMs.getTime();
        dataObject.push(
          {
            x: dateInMs.getTime(),
            y: mintTokenData[i].value,
            color: mintTokenData[i].profit < 0 ? "red" : "green"
          }
      )
    } 
    let dataConfig = merge.recursive(true, lineConfig, {
      series: [
        {
          name: "Portfolio value",
          color: "orange",
          showInLegend: false,
          data: dataObject,
        },
      ],
      xAxis: {
        min: min
      }
    });
    return dataConfig;
  };

  const getTransactionTableComponent = () => {
    return <Layout>
      <Row align="middle" style = {{ paddingTop: "60px"}}>
        <Col>
          <div style={{fontSize: "19px"}}><strong>Transactions</strong></div>
        </Col>
      </Row>
      <Table className="transaction-table" loading = {_.isEmpty(allTransactions)} columns={columns} dataSource={tableDataSource}/>
    </Layout>
  };

  const getMainContent = () =>{
    return (<div className="site-layout-content">
      {chartCard(activeMenuKey)}
      {getTransactionTableComponent()}
      </div>);
  };
  const antdDesign = () => {
    if (wallet && wallet.publicKey)
    return (
      <Layout>
        {siderComponent()}
        <Content style={{ padding: '0 50px' }}>{getMainContent()}</Content>
      </Layout>
    )
    else{
      return <Layout>
        <Content>
          Please Connect Your Wallet
        </Content>
      </Layout>
    }
  }

  const convertTransactionDictionaryToTable = (txnData, selectedKey) => {
    let rowData = [];
    console.log(selectedKey);
    if (selectedKey === "All"){
      let data = txnData
    for (var signature in data){
      let txns = data[signature];
      for (var j=0; j<txns.length; j++){
        let date = moment.unix(txns[j].time).utc().format("MMM D, YYYY / hh a");
        rowData.push({
          signature: signature,
          tokenName: txns[j].tokenName,
          from: txns[j].source,
          to: txns[j].destination,
          date: date.toString(),
          amount: txns[j].amount < 0 ? -txns[j].amount : txns[j].amount,
          mint: txns[j].mintAddress,
          type: txns[j].type
        })
    }
    }
    }
    else{
      rowData = [];
      let txns = mintTransactions[activeMenuKey];
      if(!txns)
        return;
      for (j=0; j<txns.length; j++){
        let date = moment.unix(txns[j].time).utc().format("MMM D, YYYY / hh a");
        rowData.push({
          signature: txns[j].signature,
          tokenName: txns[j].tokenName,
          from: txns[j].source,
          to: txns[j].destination,
          date: date.toString(),
          amount: txns[j].amount < 0 ? -txns[j].amount : txns[j].amount,
          mint: txns[j].mintAddress,
          type: txns[j].type
        })
    }
    }
    setTableData(rowData);
  };

  useEffect(() => {
    if (wallet && wallet.publicKey){
      fetch(serverUrl + '/getUserData/' + wallet.publicKey.toBase58())
        .then((results) => results.json())
        .then((data) => {
          let tokenDistributionBalances;
          let userTokensArray = [];
          if (data.data !== "First time user"){
          setApiResponse(data);
          setTokenGraphDetails(data.data.tokenData);
          setpnl(data.data.profitLossValue);
          if (data.data.profitLossValue.length > 0)
          {
            setYesterdayPnl(data.data.profitLossValue[data.data.profitLossValue.length-1].profit);
          }
          tokenDistributionBalances = data.data.tokenDistribution.balances;
          userTokensArray = tokenDistributionBalances.map(({tokenName, effectiveMint, marketAddress}) => {
            return {
              tokenName: tokenName,
              effectiveMint: effectiveMint,
              marketAddress: marketAddress
            };
          }).filter(item => {
            return item.tokenName !== "";
          });
        }
          let jsonBody = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
              wallet.publicKey.toBase58(),
              {
                "programId": programId
              },
              {
                "encoding": "jsonParsed"
              }
            ]
          };
          let apiBody = {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonBody)
          }
          fetch(solanaUrl, apiBody)
          .then((results) => results.json())
          .then((data2) => {
            userTokensArray = setAllTokensOwned(data2.result.value, userTokensArray);
            setUserTokens(userTokensArray);
            setYesterdayDetails(userTokensArray);
          })
        });
    if (_.isEmpty(allTransactions)){
       fetch(serverUrl + '/getTransactions/' + wallet.publicKey.toBase58())
       .then((results) => results.json())
       .then((data) => {
          setTransactions(data.transactions);
          setMintTransactions(data.mintMapping);
          activeMenuKey === "All" ? convertTransactionDictionaryToTable(data.transactions, activeMenuKey)
          : convertTransactionDictionaryToTable(data.mintMapping, activeMenuKey);
       });
    }
    else{
      activeMenuKey === "All" ? convertTransactionDictionaryToTable(allTransactions, activeMenuKey)
          : convertTransactionDictionaryToTable(mintTransactions, activeMenuKey);
    }
  }
  // eslint-disable-next-line
  }, [activeMenuKey, wallet, connected]);
  return antdDesign();
}
