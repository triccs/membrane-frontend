import { background } from "@chakra-ui/react";
import { color, px } from "framer-motion";
import { useEffect, useState } from "react";
import React from "react";

import { testnetAddrs } from "../config";
import { Coin, coin, coins, parseCoins } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import { Asset, BasketPositionsResponse, NativeToken, PositionResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { denoms, Prices } from ".";
import Popup from "../components/Popup";
import Image from "next/image";
import { relative } from "path";

declare module 'react' {
    export interface InputHTMLAttributes<T> {
      orient?: string;
    }
  }

interface Props {
    cdp_client: PositionsClient | null;
    queryClient: PositionsQueryClient | null;
    address: string | undefined;
    walletCDT: number;
    prices: Prices;
}

const Positions = ({cdp_client, queryClient, address, walletCDT, prices}: Props) => {
    //Popup
    const [popupTrigger, setPopupTrigger] = useState(false);
    const [popupMsg, setPopupMsg] = useState("");
    const [popupStatus, setPopupStatus] = useState("");
    //Start screen
    // const [startingParagraph, setStarting] = useState("Click an Asset's Quantity to initiate deposits");
    //Redemptions
    const [posClick, setposClick] = useState("mint-button-icon3");
    const [negClick, setnegClick] = useState("mint-button-icon4");
    const [redeemScreen, setredeemScreen] = useState("redemption-screen");
    const [redeemInfoScreen, setredeemInfoScreen] = useState("redemption-screen");
    const [redeemButton, setredeemButton] = useState("user-redemption-button");
    const [redeemability, setRedeemability] = useState<boolean>();
    const [premium, setPremium] = useState();
    const [loanUsage, setloanUsage] = useState();
    const [restrictedAssets, setRestricted] = useState({
        sentence: "Click Assets on the left to restrict redemption from, currently restricted: ",
        readable_assets: [] as string[],
        assets: [] as string[],
    });
    const [redemptionRes, setredemptionRes] = useState<RedeemabilityResponse>();
    //Deposit-Withdraw screen
    const [depositwithdrawScreen, setdepositwithdrawScreen] = useState("deposit-withdraw-screen");
    const [currentfunctionLabel, setcurrentfunctionLabel] = useState("");
    const [currentAsset, setcurrentAsset] = useState("");
    const [assetIntent, setassetIntent] = useState<[string , number][]>([]);
    const [maxLPamount, setmaxLPamount] = useState<bigint>(BigInt(0));
    const [amount, setAmount] = useState<number | undefined>();
    //Asset specific
        //qty
    const [osmoQTY, setosmoQTY] = useState(0);
    const [atomQTY, setatomQTY] = useState(0);
    const [axlusdcQTY, setaxlusdcQTY] = useState(0);
    const [atomosmo_poolQTY, setatomosmo_poolQTY] = useState(0);
    const [osmousdc_poolQTY, setosmousdc_poolQTY] = useState(0);
        //value
    const [osmoValue, setosmoValue] = useState(0);
    const [atomValue, setatomValue] = useState(0);
    const [axlUSDCValue, setaxlusdcValue] = useState(0);
    const [atomosmo_poolValue, setatomosmo_poolValue] = useState(0);
    const [osmousdc_poolValue, setosmousdc_poolValue] = useState(0);
        //style
    const [osmoStyle, setosmoStyle] = useState("low-opacity");
    const [atomStyle, setatomStyle] = useState("low-opacity");
    const [axlusdcStyle, setaxlusdcStyle] = useState("low-opacity");
    const [atomosmo_poolStyle, setatomosmo_poolStyle] = useState("low-opacity");
    const [osmousdc_poolStyle, setosmousdc_poolStyle] = useState("low-opacity");
    //Positions Visual
    const [debt, setDebt] = useState(0);
    const [debtAmount, setdebtAmount] = useState(0);
    const [maxLTV, setmaxLTV] = useState(100);
    const [brwLTV, setbrwLTV] = useState(0);
    const [cost, setCost] = useState(0);
    const [positionID, setpositionID] = useState("0");
    const [user_address, setAddress] = useState("");
    const [sliderValue, setsliderValue] = useState(0);
    const [creditPrice, setcreditPrice] = useState(0);


    const handleOSMOqtyClick = async (currentFunction: string) => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("OSMO");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.osmo).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(osmoQTY))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };
    const handleATOMqtyClick = async (currentFunction: string) => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("ATOM");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.atom).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(atomQTY))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };
    const handleaxlUSDCqtyClick = async (currentFunction: string) => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("axlUSDC");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.axlUSDC).then((res) => {
                    setmaxLPamount(BigInt(res.amount) / 1_000_000n);
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(axlusdcQTY))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };    
    const handleatomosmo_poolqtyClick = async (currentFunction: string) => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("ATOM-OSMO LP");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.atomosmo_pool).then((res) => {
                    setmaxLPamount(BigInt(res.amount));
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(atomosmo_poolQTY))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };
    const handleosmousdc_poolqtyClick = async (currentFunction: string) => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setcurrentAsset("OSMO-axlUSDC LP");
        if (currentFunction !== "withdraw") {
            setcurrentfunctionLabel("deposit");
            //Get account's balance
            if (address !== undefined) {
                queryClient?.client.getBalance(address as string, denoms.osmousdc_pool).then((res) => {
                    setmaxLPamount(BigInt(res.amount));
                })
            }
        } else if (currentFunction == "withdraw") {
            //Set max to collateral amount
            setmaxLPamount(BigInt(osmousdc_poolQTY))
        }
        //Send to back
        setredeemScreen("redemption-screen");
        // setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
    };

   //Redeem
    const handleredeemScreen = () => {
        setredeemScreen("redemption-screen front-screen");
        setredeemInfoScreen("redemption-screen");
        setdepositwithdrawScreen("deposit-withdraw-screen");
        //Set functionality        
        setcurrentfunctionLabel("redemptions");
        //
        //Format popup to inform user that redemptions are unaudited
        setPopupTrigger(true);
        setPopupMsg("Redemptions are unaudited & fully opt-in, so please use at your own risk.");
        setPopupStatus("Warning");
    };
    const handleredeeminfoClick = async () => {

        try {
            console.log("trying")
            await queryClient?.getBasketRedeemability({
                limit: 1,
                positionOwner: user_address,
            }).then((res) => {

            if (res?.premium_infos.length > 0) {
                setredemptionRes(res)
                setredeemScreen("redemption-screen");
                setredeemInfoScreen("redemption-screen front-screen");
                setredeemButton("user-redemption-button")
            } else {
                setredeemButton("user-redemption-button red-border")
            }
            console.log(res)
        })
        } catch (error) {
            setredeemButton("user-redemption-button red-border")
            console.log(error)
        }   

    };
    const handlesetPremium = (event: any) => {
        event.preventDefault();
        setPremium(event.target.value);
      };
    const handlesetloanUsage = (event: any) => {
        event.preventDefault();
        setloanUsage(event.target.value);
    };
    const handleposClick = () => {
        if (posClick == "mint-button-icon3") {
            setposClick("mint-button-icon3-solid");
            setnegClick("mint-button-icon4");
            setRedeemability(true);
        } else {
            setposClick("mint-button-icon3");
            setRedeemability(undefined);
        }
      };

    const handlenegClick = () => {
        if (negClick == "mint-button-icon4") {
            setnegClick("mint-button-icon4-solid");
            setposClick("mint-button-icon3");
            setRedeemability(false);
        } else {
            setnegClick("mint-button-icon4");
            setRedeemability(undefined);
        }
      };
    const handleOSMOClick = () => {
        //Search for OSMO_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.osmo)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "OSMO"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.osmo
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.osmo)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "OSMO")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleATOMClick = () => {
        //Search for ATOM_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.atom)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "ATOM"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.atom
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.atom)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "ATOM")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleaxlUSDCClick = () => {
        //Search for axlUSDC_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.axlUSDC)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "axlUSDC"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.axlUSDC
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.axlUSDC)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "axlUSDC")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleatomosmo_poolClick = () => {
        //Search for atomosmo_pool denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.atomosmo_pool)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "ATOM-OSMO LP"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.atomosmo_pool
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.atomosmo_pool)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "ATOM-OSMO LP")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleosmousdc_poolClick = () => {
        //Search for osmousdc_pool denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.osmousdc_pool)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "OSMO-axlUSDC LP"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.osmousdc_pool
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.osmousdc_pool)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "OSMO-axlUSDC LP")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    //Mint
    // const handlemintScreen = () => {
    //     //Update screens
    //     setmintrepayScreen("mintrepay-screen front-screen");
    //     setredeemScreen("redemption-screen");
    //     // setcloseScreen("redemption-screen");
    //     setredeemInfoScreen("redemption-screen");
    //     setdepositwithdrawScreen("deposit-withdraw-screen");
    //     //Update label
    //     // setmintrepayLabel("Mint");
    //     //Set functionality        
    //     setcurrentfunctionLabel("mint");
    // };
    // //Repay
    // const handlerepayScreen = () => {
    //     //Update screens
    //     setmintrepayScreen("mintrepay-screen front-screen");
    //     setredeemScreen("redemption-screen");
    //     setredeemInfoScreen("redemption-screen");
    //     // setcloseScreen("redemption-screen");
    //     setdepositwithdrawScreen("deposit-withdraw-screen");
    //     //Update label
    //     // setmintrepayLabel("Repay");handleExecution
    //     //Set functionality        
    //     setcurrentfunctionLabel("repay");
    // };
    const handlesetAmount = (event: any) => {
        event.preventDefault();
        setAmount(event.target.value);
      };
    // const handlesetmintAmount = (event: any) => {
    //     event.preventDefault();
    //     setmintAmount(event.target.value);
    // };
// const handlesetrepayAmount = (event: any) => {
//     event.preventDefault();
//     setrepayAmount(event.target.value);
//     };
    //Close
    // const handlecloseScreen = () => {
    //     // setcloseScreen("redemption-screen front-screen");
    //     setmintrepayScreen("mintrepay-screen");
    //     setredeemScreen("redemption-screen");
    //     setredeemInfoScreen("redemption-screen");
    //     setdepositwithdrawScreen("deposit-withdraw-screen");
    //     setcurrentfunctionLabel("closePosition");
    // };
    // const handlesetSpread = (event: any) => {
    //     event.preventDefault();
    //     setSpread(event.target.value);
    //   };
    //Deposit-Withdraw screen    
    const handledepositClick = async () => {
        //Reset Amount
        setAmount(0);
        //Set functionality
        setcurrentfunctionLabel("deposit");
        //clear intents
        setassetIntent([]);
        switch (currentAsset) {
            case "OSMO": {
                handleOSMOqtyClick("deposit")
                break;
            }
            case "ATOM": {
                handleATOMqtyClick("deposit")
                break;
            }
            case "axlUSDC": {
                handleaxlUSDCqtyClick("deposit")
                break;
            }
            case "ATOM-OSMO LP": {
                handleatomosmo_poolqtyClick("deposit")
                break;
            }
            case "OSMO-axlUSDC LP": {
                handleosmousdc_poolqtyClick("deposit")
                break;
            }
        }
    };
    const handlewithdrawClick = async () => {
        //Reset Amount
        setAmount(0);
        //Set functionality
        setcurrentfunctionLabel("withdraw");
        //clear intents
        setassetIntent([]);
        switch (currentAsset) {
            case "OSMO": {
                handleOSMOqtyClick("withdraw")
                break;
            }
            case "ATOM": {
                handleATOMqtyClick("withdraw")
                break;
            }
            case "axlUSDC": {
                handleaxlUSDCqtyClick("withdraw")
                break;
            }
            case "ATOM-OSMO LP": {
                handleatomosmo_poolqtyClick("withdraw")
                break;
            }
            case "OSMO-axlUSDC LP": {
                handleosmousdc_poolqtyClick("withdraw");
                break;
            }
        }
    };
    //Logo functionality activation
    const handleQTYaddition = (current_asset: string, amount: number) => {

        switch(current_asset) {
            case 'OSMO': {
                var new_qty = +osmoQTY + +amount;
                setosmoQTY(new_qty);
                setAmount(0);
                setosmoValue(new_qty * +prices.osmo);

                //Remove opacity if above 0
                if (new_qty > 0){
                    setosmoStyle("");
                }
                break;
              }
            case 'ATOM':{
                var new_qty = +atomQTY + +amount;
                setatomQTY(new_qty);
                setAmount(0);
                setatomValue(new_qty * +prices.atom);
                
                //Remove opacity if above 0
                if (new_qty > 0){
                    setatomStyle("");
                }
                break;
              }
            case 'axlUSDC':{
                var new_qty = +axlusdcQTY + +amount;
                setaxlusdcQTY(new_qty);
                setAmount(0);
                setaxlusdcValue(new_qty * +prices.axlUSDC);

                //Remove opacity if above 0
                if (new_qty > 0){
                    setaxlusdcStyle("");
                }
                break;
              }
            case 'atomosmo_pool':{
                var new_qty = +atomosmo_poolQTY + +amount;
                setatomosmo_poolQTY(new_qty);
                setAmount(0);
                setatomosmo_poolValue(new_qty * +prices.atomosmo_pool);

                //Remove opacity if above 0
                if (new_qty > 0){
                    setatomosmo_poolStyle("");
                }
                break;
            }
            case 'osmousdc_pool':{
                var new_qty = +osmousdc_poolQTY + +amount;
                setosmousdc_poolQTY(new_qty);
                setAmount(0);
                setosmousdc_poolValue(new_qty * +prices.osmousdc_pool);

                //Remove opacity if above 0
                if (new_qty > 0){
                    setosmousdc_poolStyle("");
                }
                break;
            }
          }
    };
    const handleQTYsubtraction = (current_asset: string, amount: number) => {

        switch(current_asset) {
            case 'OSMO': {
                var new_qty = +osmoQTY - +amount;
                setosmoQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setosmoStyle("low-opacity");
                    setosmoQTY(0);
                    new_qty = 0;
                }
                setosmoValue(new_qty * +prices.osmo);
                break;
              }
            case 'ATOM':{
                var new_qty = +atomQTY - +amount;
                setatomQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setatomStyle("low-opacity");
                    setatomQTY(0);
                    new_qty = 0;
                }
                setatomValue(new_qty * +prices.atom);
                break;
              }
            case 'axlUSDC':{
                var new_qty = +axlusdcQTY - +amount;
                setaxlusdcQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setaxlusdcStyle("low-opacity");
                    setaxlusdcQTY(0);
                    new_qty = 0;
                }
                setaxlusdcValue(new_qty * +prices.axlUSDC);
                break;
              }
            case 'atomosmo_pool':{
                var new_qty = +atomosmo_poolQTY - +amount;
                setatomosmo_poolQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setatomosmo_poolStyle("low-opacity");
                    setatomosmo_poolQTY(0);
                    new_qty = 0;
                }
                setatomosmo_poolValue(new_qty * +prices.atomosmo_pool);
                break;
            }
            case 'osmousdc_pool':{
                var new_qty = +osmousdc_poolQTY - +amount;
                setosmousdc_poolQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setosmousdc_poolStyle("low-opacity");
                    setosmousdc_poolQTY(0);
                    new_qty = 0;
                }
                setosmousdc_poolValue(new_qty * +prices.osmousdc_pool);
                break;
            }
          }
    };
    const handleExecution = async () => {
        //create a variable for asset_intents so we can mutate it within the function
        //duplicate intents dont work
        var asset_intent = assetIntent;
        //switch on functionality
        switch (currentfunctionLabel){
            case "deposit":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount ?? 0]];
                }
                ///parse assets into coin amounts
                var user_coins = getcoinsfromassetIntents(asset_intent);

                try {
                    ////Execute Deposit////
                    await cdp_client?.deposit({
                        positionId: (positionID === "0" ? undefined : positionID),
                        positionOwner: user_address,
                    },
                    "auto", undefined, user_coins).then(async (res) => {
                        console.log(res?.events.toString())
                        //format pop up
                        setPopupTrigger(true);
                        //map asset intents to readable string
                        var readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        setPopupMsg("Deposit of " +readable_asset_intent+ " successful");
                        setPopupStatus("Success");   
                        //Update Position data
                        fetch_update_positionData();
                    });

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Deposit Error");
                }
               break;
            }
            case "withdraw":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount ?? 0]];
                }                
                ///parse assets into coin amounts
                var assets = getassetsfromassetIntents(asset_intent);
                
                try {
                    ////Execute Withdraw////
                    await cdp_client?.withdraw({
                        assets: assets,
                        positionId: positionID,
                    },
                    "auto").then((res) => {       
                        console.log(res?.events.toString())   
                        //map asset intents to readable string
                        let readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Withdrawal of " +readable_asset_intent+ " successful");
                        setPopupStatus("Success");              
                        //Update Position data
                        fetch_update_positionData();
                    })

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Withdrawal Error");
                } 
                break;
            }
            case "mint": {                
                try {
                    ///Execute the Mint
                    await cdp_client?.increaseDebt({
                        positionId: positionID,
                        amount: ((amount ?? 0) * 1_000_000).toString(),
                    }).then((res) => {           
                        console.log(res?.events.toString())             
                        //Update mint amount
                        setDebt(+debt + +(amount ?? 0));
                        setdebtAmount(+debtAmount + +(amount ?? 0));
                        setsliderValue((+debtAmount + +(amount ?? 0))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Mint of " +(amount ?? 0)+ " CDT into your wallet successful. Be aware that now that you've minted, you can't withdraw collateral that would push your LTV past the yellow line & you'll be liquidated down to said line if you reach the red. Also, you can't pay below minimum debt so if you've minted at the minimum you'll need to repay in full + interest.");
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Mint Error");
                }
                
                break;
            } 
            case "repay": {
                try {
                    ///Execute the contract
                    var res = await cdp_client?.repay({
                        positionId: positionID,
                    }, "auto", undefined, coins((amount ?? 0) * 1_000_000, denoms.cdt))
                    .then((res) => {           
                        console.log(res?.events.toString())
                        //Update mint amount
                        setDebt(+debt - +(amount ?? 0));
                        setdebtAmount(+debtAmount - +(amount ?? 0));
                        setsliderValue((+debtAmount - +(amount ?? 0))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Repayment of " +(amount ?? 0)+ " CDT successful");
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Repay Error");
                }
                break;
            }
            case "redemptions": {
                try {                    
                    ///Execute the contract
                    await cdp_client?.editRedeemability(
                    {
                        positionIds: [positionID],
                        maxLoanRepayment: loanUsage ?? undefined,
                        premium: premium ?? undefined,
                        redeemable: redeemability ?? undefined,
                        restrictedCollateralAssets: restrictedAssets.assets ?? undefined,
                    }, "auto", undefined).then(async (res) => {
                        console.log(res?.events.toString())
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Redemption settings updated successfully");
                        setPopupStatus("Success");
                    })

                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Edit Redemption Info Error");
                }
            }
        }

    };
    const handleassetIntent = () => {
        if (amount !== undefined && amount > 0){
            setassetIntent(prevState => [
                ...prevState,
                [currentAsset, amount]
            ]);
        }
    };
    //we add decimals to the asset amounts
    const getcoinsfromassetIntents = (intents: [string, number][]) => {
        var workingIntents: Coin[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.osmo))
                    break;
                }
                case "ATOM": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.atom))
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.axlUSDC))
                    break;
                }
                case "ATOM-OSMO LP": { //No normalization bc we are excepting 18 decimal
                    workingIntents.push(coin(intent[1].toString(), denoms.atomosmo_pool))
                    break;
                }
                case "OSMO-axlUSDC LP": { //No normalization bc we are excepting 18 decimal
                    workingIntents.push(coin(intent[1].toString(), denoms.osmousdc_pool))
                    break;
                }
            }
        })
        return workingIntents
    };
    const getassetsfromassetIntents = (intents: [string, number][]) => {
        var workingIntents: Asset[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.osmo,
                        }}
                    })
                    break;
                }
                case "ATOM": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.atom,
                        }}
                    })
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.axlUSDC,
                        }}
                    })
                    break;
                }
                case "ATOM-OSMO LP": { //18 decimal instead of 6
                    workingIntents.push({
                        amount: (intent[1]).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.atomosmo_pool,
                        }}
                    })
                    break;
                }
                case "OSMO-axlUSDC LP": { //18 decimal instead of 6
                    workingIntents.push({
                        amount: (intent[1]).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.osmousdc_pool,
                        }}
                    })
                    break;
                }
            }
        })
        return workingIntents
    };
    /// zero asset QTY, TVL, debt, liq. value
    // const zeroData = () => {
    //     handleQTYsubtraction("OSMO", osmoQTY);
    //     handleQTYsubtraction("ATOM", atomQTY);
    //     handleQTYsubtraction("axlUSDC", axlusdcQTY);

    //     setDebt(0); setmaxLTV(0);
    // };

   const fetch_update_positionData = async () => {
        //Query for position data
        try {
            
            //getBasket
            const basketRes = await queryClient?.getBasket();

            //getPosition
            const userRes = await queryClient?.getBasketPositions(
                {
                    user: address as string,
                }
            );
            
            //query rates
            const rateRes = await queryClient?.getCollateralInterest();
            const creditRateRes = await queryClient?.getCreditRate();


            // console.log("userRes: ", userRes)
            //Set state
            if (userRes != undefined){
                //setPositionID
                //@ts-ignore
                setpositionID(userRes[0].positions[0].position_id)
                //Set debtAmount
                var debt_amount = parseInt(userRes[0].positions[0].credit_amount);
                setdebtAmount(debt_amount);
                setsliderValue(debt_amount/1000000);
                //setLTVs
                //@ts-ignore
                setmaxLTV(parseFloat(userRes[0].positions[0].avg_max_LTV) * +100)
                //@ts-ignore
                setbrwLTV(parseFloat(userRes[0].positions[0].avg_borrow_LTV) * +100)
                
                
                //setAssetQTYs
                //@ts-ignore
                userRes[0].positions[0].collateral_assets.forEach(asset => {
                    // @ts-ignore
                    var actual_asset = asset.asset.info.native_token.denom;
                    
                    console.log("actual_asset: ", actual_asset)
                    if (actual_asset === denoms.osmo) {
                        setosmoQTY(parseInt(asset.asset.amount) / 1_000_000)                            
                        setosmoValue(parseFloat((parseInt(asset.asset.amount) / 1_000_000 * +prices.osmo).toFixed(2)));
                        setosmoStyle("");
                    } else if (actual_asset === denoms.atom) {
                        setatomQTY(parseInt(asset.asset.amount) / 1_000_000)
                        setatomValue(parseFloat((parseInt(asset.asset.amount) / 1_000_000 * +prices.atom).toFixed(2)));
                        setatomStyle("");
                    } else if (actual_asset === denoms.axlUSDC) {
                        setaxlusdcQTY(parseInt(asset.asset.amount) / 1_000_000)
                        setaxlusdcValue(parseFloat((parseInt(asset.asset.amount) / 1_000_000 * +prices.axlUSDC).toFixed(2)));
                        setaxlusdcStyle("");
                    } else if (actual_asset === denoms.atomosmo_pool) {
                        setatomosmo_poolQTY(parseInt(asset.asset.amount))
                        setatomosmo_poolValue(parseFloat((parseInt(asset.asset.amount) * +prices.atomosmo_pool).toFixed(2)));
                        setatomosmo_poolStyle("");
                    } else if (actual_asset === denoms.osmousdc_pool) {
                        setosmousdc_poolQTY(parseInt(asset.asset.amount))
                        setosmousdc_poolValue(parseFloat((parseInt(asset.asset.amount) * +prices.osmousdc_pool).toFixed(2)));
                        setosmousdc_poolStyle("");
                    }                    
                })

                if (basketRes != undefined){
                    
                    //calc Debt
                    //@ts-ignore
                    var new_debt = parseFloat(((debt_amount/ 1_000_000) * parseFloat(basketRes.credit_price.price)).toFixed(2));
                    setcreditPrice(parseFloat(basketRes.credit_price.price))
                    //setDebt
                    setDebt(new_debt)
                    
                    if (rateRes != undefined){
                        ///setCost///
                        var total_rate = 0.0;
                        //get the positions collateral indices in Basket rates
                        //@ts-ignore
                        userRes[0].positions[0].collateral_assets.forEach((asset, index, _) => {
                            //find the asset's index                
                            var rate_index = basketRes.collateral_types.findIndex((info) => {
                                // @ts-ignore
                                return info.asset.info.native_token.denom === asset.asset.info.native_token.denom
                            })

                            //use the index to get its interest rate
                            var asset_rate = rateRes.rates[rate_index];

                            //add pro-rata rate to sum 
                            //@ts-ignore
                            total_rate += parseFloat((parseFloat(asset_rate) * parseFloat(userRes[0].positions[0].cAsset_ratios[index])).toFixed(4));
                        })

                        if (creditRateRes != undefined){
                            //Add credit rate to cost
                            if (creditRateRes.negative_rate && basketRes.negative_rates){
                                total_rate -= parseFloat(creditRateRes.credit_interest);
                                console.log(creditRateRes.negative_rate && basketRes.negative_rates)
                            } else {
                                total_rate += parseFloat(creditRateRes.credit_interest);
                            }   
                        }
                        //setCost 
                        setCost(total_rate);
                    }
                    
                }
            }
            
        } catch (error) {
            console.log(error)
        }
   };   
   const onTFMTextClick = () => {
        window.open(
        "https://tfm.com/ibc"
        );
   };  
   const onSquidTextClick = () => {
        window.open(
        "https://app.squidrouter.com/"
        );
   };

    //getuserPosition info && set State
    useEffect(() => {
        if (address) {
            console.log("address: ", address)
            //setAddress
            setAddress(address as string)

            if (positionID === "0"){
                //fetch & Update position data
                fetch_update_positionData()
            }
            //Update value of assets
            setosmoValue(osmoQTY * +prices.osmo);
            setatomValue(atomQTY * +prices.atom);
            setaxlusdcValue(axlusdcQTY * +prices.axlUSDC);
            setatomosmo_poolValue(atomosmo_poolQTY * +prices.atomosmo_pool);
            setosmousdc_poolValue(osmousdc_poolQTY * +prices.osmousdc_pool);
        } else {        
            console.log("address: ", address)
        }
    }, [address, cdp_client, queryClient, prices])

  return (
    <div className="positions">
      <div>
        <div className="vault-page">
          <div className="vault-subframe">
            <div className="debt-visual">
              <div className="infobox-icon" />
              <div className="max-ltv">
                <div className="liq-value">${(debt / (maxLTV / 100)).toFixed(2)}</div>
                <div className="cdp-div2">{maxLTV.toFixed(0)}%</div>
                <div className="max-ltv-child" />
              </div>
              <div className="max-borrow-ltv" style={{top: 75 + (335 * ((maxLTV-brwLTV)/maxLTV))}}>
                <div className="cdp-div3" >{brwLTV.toFixed(2)}%</div>
                <div className="max-borrow-ltv-child" />
              </div>
              <div className="debt-visual-child" />
              <div className="debt-visual-item" style={{top: 465 - (363 * ((debt/(osmoValue + atomValue + axlUSDCValue + atomosmo_poolValue + osmousdc_poolValue+1)) / (maxLTV/100))), height: (340 * (debt/(osmoValue + atomValue + axlUSDCValue + atomosmo_poolValue + osmousdc_poolValue+1)) / (maxLTV/100))}}/>
              <div className="debt-visual-label" style={{top: 445 - (359 * ((debt/(osmoValue + atomValue + axlUSDCValue + atomosmo_poolValue + osmousdc_poolValue+1)) / (maxLTV/100)))}}>{(debtAmount/1000000).toString()} CDT</div>
              <input className="cdt-amount" style={{top: 100 + (335 * ((maxLTV-brwLTV)/maxLTV)), height: 445 - (100 + (335 * ((maxLTV-brwLTV)/maxLTV)))}} 
                name="amount" type="range" min="0" max={((osmoValue + atomValue + axlUSDCValue + atomosmo_poolValue + osmousdc_poolValue)*(brwLTV/100))/Math.max(creditPrice, 1)} value={sliderValue} orient="vertical" onChange={({ target: { value: radius } }) => {
                if ((debtAmount/1000000) - parseInt(radius) > (walletCDT/1000000)){
                    setsliderValue((debtAmount - walletCDT)/1000000);

                    //Bc we know this is a repay (less than current debt), set amount to Wallet CDT
                    setAmount((walletCDT/1000000));
                    setcurrentfunctionLabel("repay");
                } else {
                    setsliderValue(parseInt(radius));

                    if (parseInt(radius) > (debtAmount/1000000)){
                        //Bc we know this is a mint (more than current debt), set amount to radius - debt amount. Radius at 114 -100 debt = 14 new mint
                        setAmount(parseInt((parseInt(radius) - (debtAmount/1000000)).toFixed(0)));
                        setcurrentfunctionLabel("mint");
                    } else {
                        //Bc we know this is a repay (less than current debt), set amount to radius
                        setAmount(parseInt(parseInt(radius).toFixed(0)));
                        setcurrentfunctionLabel("repay");
                    }
                }
              }}/>
              <div className={sliderValue > (debtAmount/1000000) ? "green range-label" : sliderValue < (debtAmount/1000000) ? "red range-label" : "neutral range-label"} 
               style={{top: -(sliderValue * 1.8) + (407) + (335 * ((maxLTV-brwLTV)/maxLTV))}}>
                {(sliderValue - (debtAmount/1000000)) > 0 ? "+" : null}{(sliderValue - (debtAmount/1000000)).toFixed(1)}
              </div>
              <div className="cost-4">{cost > 0 ? "+" : null}{cost.toFixed(4)}%/yr</div>              
              <div className="position-stats">
              <div className="infobox-icon2" />
              <div className={currentfunctionLabel !== "repay" ? "low-opacity repay-button" : "repay-button"} onClick={handleExecution}>                
                  <div className="repay" onClick={handleExecution}>REPAY</div>
              </div>
              <div className={currentfunctionLabel !== "mint" ? "low-opacity mint-button" : "mint-button"} data-descr={debtAmount === 0 ? "Use the slider to mint/repay" : null} onClick={handleExecution}>
                  <div className="mint" onClick={handleExecution}>MINT</div>                
              </div>
              <Image className="cdt-logo-icon-cdp" width={45} height={45} alt="" src="/images/CDT.svg" />
              <div className="position-visual-words">Mint CDT using the value of your collateralized Bundle</div>
              <div className="position-visual-words-btmright">Repay your debt using the CDT in your wallet</div>
              </div>
            </div>
            <div className="asset-info">
              <div className="infobox-icon3"/>
              <div className="asset-info-child" />
              <div className="asset-info-item" />
              <div className="asset-info-inner" />
              <div className="line-div" />
              <div className="asset-info-child1" />
              <div className="asset-info-child2" />
              <div className="asset-info-child3" />
              <div className="asset">Asset</div>
              <div className="qty">Quantity</div>
              <div className="value">Value</div>
              <div>
                <Image className={osmoStyle+" osmo-logo-icon"} width={45} height={45} alt="" src="images/osmo.svg" onClick={handleOSMOClick}/>
                <div className={"osmo-qty"} onClick={()=>handleOSMOqtyClick(currentfunctionLabel)}>{osmoQTY === 0 ? "Add" : osmoQTY > 1000 ? (osmoQTY/1000).toFixed(2)+"k" : osmoQTY}</div>
                <div className={osmoStyle +" cdp-div5"}>${ osmoValue > 1000 ? (osmoValue/1000).toFixed(2)+"k" : osmoValue.toFixed(2)}</div>
              </div>              
              <div>
                <Image className={atomStyle + " atom-logo-icon"} width={45} height={45} alt="" src="images/atom.svg" onClick={handleATOMClick} />
                <div className={"atom-qty"} onClick={()=>handleATOMqtyClick(currentfunctionLabel)}>{atomQTY === 0 ? "Add" : atomQTY > 1000 ? (atomQTY/1000).toFixed(2)+"k" : atomQTY}</div>
                <div className={atomStyle + " cdp-div7"}>${atomValue > 1000 ? (atomValue/1000).toFixed(2)+"k" : atomValue.toFixed(2)}</div>
              </div>
              <div>
                <Image className={axlusdcStyle + " axlusdc-logo-icon"} width={45} height={45} alt="" src="images/usdc.svg" onClick={handleaxlUSDCClick} />
                <div className={"axlUSDC-qty"} onClick={()=>handleaxlUSDCqtyClick(currentfunctionLabel)}>{axlusdcQTY === 0 ? "Add" : axlusdcQTY > 1000 ? (axlusdcQTY/1000).toFixed(2)+"k" : axlusdcQTY}</div>
                <div className={axlusdcStyle + " cdp-div9"}>${axlUSDCValue > 1000 ? (axlUSDCValue/1000).toFixed(2)+"k" : axlUSDCValue.toFixed(2)}</div>
              </div>
              <div style={{opacity:0}}>
                <Image className={atomosmo_poolStyle+" atomosmopool-atom-icon"} width={45} height={45} alt="" src="images/atom.svg"  onClick={(handleatomosmo_poolClick)}/>
                <Image className={atomosmo_poolStyle+" atomosmopool-osmo-icon"} width={45} height={45} alt="" src="images/osmo.svg"  onClick={(handleatomosmo_poolClick)}/>
                {/* <div className={"atomosmopool-qty"} onClick={()=>handleatomosmo_poolqtyClick(currentfunctionLabel)}>{getReadableLPQTY(atomosmo_poolQTY)}</div> */}
                <div className={atomosmo_poolStyle + " cdp-div11"}>${(atomosmo_poolValue).toFixed(2)}</div>
              </div>
              <div style={{opacity:0}}>
                <Image className={osmousdc_poolStyle+" osmousdcpool-osmo-icon"} width={45} height={45} alt="" src="images/osmo.svg"  onClick={(handleosmousdc_poolClick)}/>
                <Image className={osmousdc_poolStyle+" osmousdcpool-usdc-icon"} width={45} height={45} alt="" src="images/usdc.svg"  onClick={(handleosmousdc_poolClick)}/>
                {/* <div className={"osmousdcpool-qty"} onClick={()=>handleosmousdc_poolqtyClick(currentfunctionLabel)}>{getReadableLPQTY(osmousdc_poolQTY)}</div> */}
                <div className={osmousdc_poolStyle+" cdp-div13"}>${(osmousdc_poolValue).toFixed(2)}</div>
              </div>
            </div>
            <div className="tvl-500">TVL: ${(osmoValue + atomValue + axlUSDCValue + atomosmo_poolValue + osmousdc_poolValue).toFixed(2)}</div>
          </div>
          <div className="controller-item">
            <div className="controller-border"/>
            <div className="controller-frame"/>
            <div className="controller-label"/>
            <div className="controller-screen-blank"> 
                <div className="starting-screen">
                    { currentfunctionLabel === "" ? 
                    <>Depositing requires assets on Osmosis. Bridge/swap to using:&nbsp;
                    <a className="nowrap" style={{textDecoration: "underline"}} onClick={onTFMTextClick}>TFM</a> for IBC or <a className="nowrap" style={{textDecoration: "underline"}} onClick={onSquidTextClick}>Squid</a>
                    &nbsp;if outside IBC-connected chains.</>
                    : null}
                </div>
            </div>
            <div className="controller" onClick={currentfunctionLabel === "redemptions" ? handleredeeminfoClick : handleredeemScreen}>Collateral</div>
            <div className={redeemButton} onClick={handleExecution}>
                <div className="spacing-btm">{currentfunctionLabel === "deposit" ? "Deposit" : currentfunctionLabel === "withdraw" ? "Withdraw" : currentfunctionLabel === "redemptions" ? "Update" : "<-----" }</div>
            </div>    
            <div className={redeemScreen}>
                <form>            
                    <input className="mint-button-icon2" style={{backgroundColor:"#454444"}} name="premium" value={premium} type="number" onChange={handlesetPremium}/>
                    <div className={posClick} onClick={handleposClick}/>
                    <div className={negClick} onClick={handlenegClick}/>
                    <div className="premium-label">Premium</div>
                    <input className="mint-button-icon5" style={{backgroundColor:"#454444"}} name="loan-usage" defaultValue={0.01} value={loanUsage} type="number" onChange={handlesetloanUsage}/>
                    <div className="loan-usage">% Loan Usage</div>
                </form>
                <div className="edit-redeemability">Redeemability Status</div>
                <div className="click-assets-on">
                {restrictedAssets.sentence}
                </div>
            </div>
            <div className={redeemInfoScreen}>
                    <div className="user-redemptions">
                        <div>Premium: {redemptionRes?.premium_infos[0].premium }</div>
                        { redemptionRes !== undefined ? <div>Left to Redeem: {parseInt(redemptionRes?.premium_infos[0].users_of_premium[0].position_infos[0].remaining_loan_repayment)/ 1_000_000}</div> : null}
                        <div>Restricted Assets: {redemptionRes?.premium_infos[0].users_of_premium[0].position_infos[0].restricted_collateral_assets}</div>
                    </div>
            </div>
            <div className={depositwithdrawScreen}>
                <div className={currentfunctionLabel === "deposit" ? "cdp-deposit-label bold" : "cdp-deposit-label low-opacity"} onClick={handledepositClick}>Deposit</div>
                <div className="slash">/</div>
                <div className={currentfunctionLabel === "withdraw" ? "cdp-withdraw-label bold" : "cdp-withdraw-label low-opacity"} onClick={handlewithdrawClick}>Withdraw</div>
                <form>
                    { maxLPamount !== BigInt(0) ? (<><div className="max-amount-label" onClick={()=>{setAmount(Number(maxLPamount))}}>max: {maxLPamount.toString()}</div></>) : null}            
                    <label className="amount-label">{currentAsset} amount:</label>     
                    <input className="amount" style={{backgroundColor:"#454444"}} name="amount" value={currentfunctionLabel !== "deposit" && currentfunctionLabel !== "withdraw" ? 0 : amount} type="number" onChange={handlesetAmount}/>
                </form>
            </div>
          </div>
        </div>

        <Image className="pie-chart-icon1" width={48} height={48} alt="" src="images/pie_chart.svg" />          
        <div className="vaults1">VAULTS</div>
      </div>
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>
  );
};

export default Positions;