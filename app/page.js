"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Head from 'next/head';
import { Button, Input, Link, Card, CardBody, CardHeader } from "@nextui-org/react";
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWriteContract, useSwitchChain, useSimulateContract, useAccount, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from '@tanstack/react-query'

import AyeAyeCoin_ABI from "./ABI/AyeAyeCoin_ABI.json";
import WAAC_ABI from "./ABI/WAAC_ABI.json"

export default function Home() {
  const [dropboxAddress, setDropboxAddress] = useState("");
  const [hasDropbox, setHasDropbox] = useState(false);
  const [waacBalance, setWaacBalance] = useState(0);
  const [ayeAyeBalance, setAyeAyeBalance] = useState(0);
  const [totalWrappedSupply, setTotalWrappedSupply] = useState(0);
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const [sendAyeAyeAmount, setSendAyeAyeAmount] = useState("");
  const [dropboxBalance, setDropboxBalance] = useState(0);

  const AyeAyeCoin_contract_address = process.env.NEXT_PUBLIC_AYEAYECOIN_CONTRACT_ADDRESS;
  const WAAC_contract_address = process.env.NEXT_PUBLIC_WAAC_CONTRACT_ADDRESS;

  const queryClient = useQueryClient()

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const desiredNetworkId = 1;

  const handleSwitchChain = () => {
    switchChain({ chainId: desiredNetworkId });
  };

  const { data: readHasDropbox, isSuccess: isSuccessReadHasDropbox, queryKey: hasDropBoxQueryKey } = useReadContract({
    address: WAAC_contract_address,
    abi: WAAC_ABI,
    functionName: 'dropBoxes',
    args: [address],
  });

  useEffect(() => {
    if (isConnected && isSuccessReadHasDropbox && readHasDropbox !== undefined) {
      if (readHasDropbox != "0x0000000000000000000000000000000000000000") {
        setDropboxAddress(readHasDropbox);
        setHasDropbox(true);
      }
      else{
        setDropboxAddress("");
        setHasDropbox(false);
      }
    }
  }, [readHasDropbox, isSuccessReadHasDropbox, isConnected]);

  const { data: readWaacBalance, isSuccess: isSuccessReadWaacBalance, queryKey: waacBalanceQueryKey } = useReadContract({
    address: WAAC_contract_address,
    abi: WAAC_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (isConnected && isSuccessReadWaacBalance && readWaacBalance !== undefined) {
      setWaacBalance(parseInt(readWaacBalance));
    }
  }, [readWaacBalance, isSuccessReadWaacBalance, isConnected]);

  const { data: readTotalWrappedSupply, isSuccess: isSuccessReadTotalWrappedSupply, queryKey: totalWrappedSupplyQueryKey } = useReadContract({
    address: WAAC_contract_address,
    abi: WAAC_ABI,
    functionName: 'totalSupply'
  });

  useEffect(() => {
    if (isConnected && isSuccessReadTotalWrappedSupply && readTotalWrappedSupply !== undefined) {
      setTotalWrappedSupply(parseInt(readTotalWrappedSupply));
    }
  }, [readTotalWrappedSupply, isSuccessReadTotalWrappedSupply, isConnected]);

  const { data: readAyeAyeBalance, isSuccess: isSuccessReadAyeAyeBalance, queryKey: ayeAyeBalanceQueryKey } = useReadContract({
    address: AyeAyeCoin_contract_address,
    abi: AyeAyeCoin_ABI,
    functionName: 'coinBalanceOf',
    args: [address]
  });

  useEffect(() => {
    if (isSuccessReadAyeAyeBalance && readAyeAyeBalance !== undefined) {
      setAyeAyeBalance(parseInt(readAyeAyeBalance));
    }
  }, [readAyeAyeBalance, isSuccessReadAyeAyeBalance, isConnected]);

  const { data: readDropboxBalance, isSuccess: isSuccessReadDropboxBalance, queryKey: dropboxBalanceQueryKey } = useReadContract({
    address: AyeAyeCoin_contract_address,
    abi: AyeAyeCoin_ABI,
    functionName: 'coinBalanceOf',
    args: dropboxAddress ? [dropboxAddress] : undefined,
  });

  useEffect(() => {
    if (isConnected && isSuccessReadDropboxBalance && readDropboxBalance !== undefined) {
      setDropboxBalance(parseInt(readDropboxBalance));
    }
  }, [readDropboxBalance, isSuccessReadDropboxBalance, isConnected]);



  const { data: simulateCreateDropbox } = useSimulateContract({
    address: WAAC_contract_address,
    abi: WAAC_ABI,
    functionName: 'createDropBox',
    account: address,
  });

  const { writeContract: createDropbox, data: createDropboxHash } = useWriteContract();

  const { isSuccess: createDropboxConfirmed } =
    useWaitForTransactionReceipt({
      hash: createDropboxHash,
    })

  const { data: simulateWrap } = useSimulateContract({
    address: WAAC_contract_address,
    abi: WAAC_ABI,
    functionName: 'wrap',
    args: dropboxBalance ? [dropboxBalance] : undefined,
    account: address,
  });

  const { writeContract: wrap, data: wrapHash } = useWriteContract();

  const { isSuccess: wrapConfirmed } =
    useWaitForTransactionReceipt({
      hash: wrapHash,
    })

  const { data: simulateUnwrap } = useSimulateContract({
    address: WAAC_contract_address,
    abi: WAAC_ABI,
    functionName: 'unwrap',
    args: unwrapAmount >= 1 ? [unwrapAmount] : undefined,
    account: address,
  });

  const { writeContract: unwrap, data: unwrapHash } = useWriteContract();

  const { isSuccess: unwrapConfirmed } =
    useWaitForTransactionReceipt({
      hash: unwrapHash,
    })

  const { data: simulateSendAyeAye } = useSimulateContract({
    address: AyeAyeCoin_contract_address,
    abi: AyeAyeCoin_ABI,
    functionName: 'sendCoin',
    args: hasDropbox && sendAyeAyeAmount >= 1 ? [dropboxAddress, sendAyeAyeAmount] : undefined,
    account: address,
  });

  const { writeContract: sendAyeAye, data: sendAyeAyeHash } = useWriteContract();

  const { isSuccess: sendAyeAyeConfirmed } =
    useWaitForTransactionReceipt({
      hash: sendAyeAyeHash,
    })

  useEffect(() => {
    queryClient.invalidateQueries({ waacBalanceQueryKey })
    queryClient.invalidateQueries({ dropboxBalanceQueryKey })
    queryClient.invalidateQueries({ totalWrappedSupplyQueryKey })
    queryClient.invalidateQueries({ ayeAyeBalanceQueryKey })

  }, [sendAyeAyeConfirmed, unwrapConfirmed, wrapConfirmed])

  useEffect(() => {
    queryClient.invalidateQueries({ hasDropBoxQueryKey })
    queryClient.invalidateQueries({ totalWrappedSupplyQueryKey })
  }, [createDropboxConfirmed])


  return (
    <main className="flex min-h-screen items-center justify-center bg-green-700">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AyeAyeCoin Wrapper</title>
      </Head>

      <div className='flex flex-col items-center justify-center'>

        <div className='py-2 px-3 md:pt-2 md:pb-4 md:px-6 mt-2 bg-stone-600 text-center rounded-2xl border-yellow-500 border-8 w-auto text-yellow-500'>
        <h3 className=' text-6xl md:text-7xl'>AyeAyeCoin</h3>
        <h3 className=' text-4xl md:text-4xl mt-3 md:mb-1 mb-2'>Wrapper</h3>
        {isConnected && totalWrappedSupply != 0 && <h3 className='text-md md:text-xl mt-3'>{new Intl.NumberFormat().format(totalWrappedSupply)} / 6M wrapped</h3>}
        </div>

        <div className="text-center mt-4 mb-4">
          {chain?.id !== desiredNetworkId && isConnected ? (
            <Button variant="solid" color="danger" onClick={handleSwitchChain}>
              Switch to Mainnet
            </Button>
          ) : (
            <ConnectButton chainStatus="none" showBalance={false} />
          )}
        </div>
        <div className="flex flex-col max-w-xl gap-4">
        <Card className='bg-yellow-500 p-3 flex-grow'>
          <CardHeader className="items-center justify-center border-b-3 border-green-700">
            <h3 className=" text-xl">Wrap AyeAyeCoin into $WAAC:</h3>
          </CardHeader>
          <CardBody className="items-center justify-center text-center">

         <Button onClick={() => createDropbox(simulateCreateDropbox?.request)} auto className="bg-green-600 mb-2 mt-2" isDisabled={!isConnected || hasDropbox}>
         {hasDropbox ? (<p>Wrapping Process Initialized</p>) : (<p>1. Initialize Wrapping Process</p>)}
                </Button>
          <Input
              clearable
              variant="bordered"
              size="lg"
              type="number"
              placeholder="Enter amount to wrap"
              min={1}
              value={sendAyeAyeAmount}
              onChange={(e) => setSendAyeAyeAmount(e.target.value)}
              label={
                <>
                  Balance:&nbsp;
                  <button className="hover:underline" disabled={!isConnected || !hasDropbox || !(ayeAyeBalance > 0)} onClick={() => setSendAyeAyeAmount(ayeAyeBalance)}>
                    {ayeAyeBalance} AyeAyeCoin
                  </button> 
                </>
              }
              className="mb-4 mt-2 w-72"
              isDisabled={!isConnected || !hasDropbox}
            />
                <Button onClick={() => sendAyeAye(simulateSendAyeAye?.request)} auto className="bg-green-600 mb-2" isDisabled={!isConnected || !hasDropbox || !(ayeAyeBalance > 0)}>
                  {hasDropbox ? (<p>1. Send AyeAyeCoin to Wrapper</p>) : (<p>2. Send AyeAyeCoin to Wrapper</p>)}
                </Button>
                <Button onClick={() => wrap(simulateWrap?.request)} auto className="bg-green-600 mb-2" isDisabled={!isConnected || !hasDropbox || !(dropboxBalance > 0)}>
                  {hasDropbox ? (<p>2. Wrap</p>) : (<p>3. Wrap</p>)}
                </Button>

          </CardBody>
        </Card>

        <Card className=' bg-yellow-500 p-3 flex-grow'>
          <CardHeader className="items-center justify-center border-b-3 border-green-700">
            <h3 className="bold text-xl">Unwrap $WAAC into AyeAyeCoin:</h3>
          </CardHeader>
          <CardBody className="items-center justify-center text-center">

          <Input
              clearable
              variant="bordered"
              size="lg"
              type="number"
              placeholder="Enter amount to unwrap"
              min={1}
              value={unwrapAmount}
              onChange={(e) => setUnwrapAmount(e.target.value)}
              label={
                <>
                  Balance:&nbsp;
                  <button className="hover:underline" disabled={!isConnected || !(waacBalance > 0)} onClick={() => setUnwrapAmount(waacBalance)}>
                    {waacBalance} $WAAC
                  </button> 
                </>
              }
              className="mb-4 mt-2 w-72"
              isDisabled={!isConnected}
            />
                <Button onClick={() => unwrap(simulateUnwrap?.request)} auto className=" bg-green-600 mb-2" isDisabled={!isConnected || !(waacBalance > 0)}>
                  Unwrap
                </Button>

          </CardBody>
        </Card>
        </div>

        <Link href={`https://ayeayecoin.xyz/`} className='mt-4' isExternal>
        <Image
          src="/AyeAyeCircle.png"
          width={300}
          height={300}
          alt="AyeAye"
        />
      </Link>

        <div className="flex flex-row bg-stone-600 gap-5 p-3 px-5 md:px-7 rounded-xl mt-4 mx-2 border-yellow-500 border-5">
          <Link href={`https://etherscan.io/address/${WAAC_contract_address}`} isExternal>
            <Image src="/etherscan.png" width={29} height={29} alt="etherscan" />
          </Link>
          <Link href={`https://etherscan.io/address/${AyeAyeCoin_contract_address}`} isExternal>
            <Image src="/etherscan.png" width={29} height={29} alt="etherscan" />
          </Link>
          <Link href={`https://github.com/tschoerv/ayeayecoin-wrapper-frontend`} isExternal>
            <Image src="/github.png" width={30} height={30} alt="github" />
          </Link>
          <Link href={`https://discord.gg/nft-relics`} isExternal>
            <Image src="/discord.png" width={30} height={30} alt="discord" />
          </Link>
          <Link href={`https://t.me/ayeayeportal`} isExternal>
            <Image src="/telegram.svg" width={30} height={30} alt="telegram" />
          </Link>   
          <Link href={`https://x.com/AyeAyeCoin2015`} isExternal>
            <Image src="/twitter.png" width={30} height={30} alt="x" />
          </Link>
          <Link href={`https://dexscreener.com/ethereum/0xeba623e4f5c7735427a9ef491ecee082dd4bf6ce`} isExternal>
            <Image src="/dexscreener.png" width={30} height={30} alt="dexscreener" />
          </Link>
          <Link href={`https://www.coingecko.com/en/coins/wrapped-ayeayecoin`} isExternal>
            <Image src="/coingecko.png" width={30} height={30} alt="coingecko" />
          </Link>
        </div>

        <div className="flex flex-row mt-1 mb-4 text-white">
          <p>made by&nbsp;</p>
          <Link href={`https://twitter.com/tschoerv`} color='secondary' isExternal>
            tschoerv.eth
          </Link>
          <p>&nbsp;- donations welcome!</p>
        </div>
        </div>
    </main>
  );
}