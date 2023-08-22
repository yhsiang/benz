import { Web3Button } from '@web3modal/react'
import { Box, Button, Heading, Input } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { prepareWriteContract, waitForTransaction, writeContract, readContract } from 'wagmi/actions'
import benzNFTabi from '../../abis/BenzNFT.json'
import { ContractFunctionExecutionError } from 'viem'
import { postProfile } from '@/apis/profile'
import { useAccount } from 'wagmi'

function addIPFSProxy(ipfsHash: string): string {
  // const URL = "https://<YOUR_SUBDOMAIN>.infura-ipfs.io/ipfs/"
  const URL = process.env.NEXT_PUBLIC_IPFS_URL as string //"http://localhost:8080/ipfs/"
  // const hash = ipfsHash.replace(/^ipfs?:\/\//, '')
  if (!URL) {
    return ipfsHash
  }

  const hash = ipfsHash.replace(/^https:\/\/ipfs.io\/ipfs\//, '')
  const ipfsURL = URL + hash

  return ipfsURL
}

const BenzNFTAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

const regexpRevertedReason = /^Error: VM Exception while processing transaction: reverted with reason string \'(.+)\'$/

type Metadata = {
  name: string
  description: string
  image: string
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false)
  const [nric, setNRIC] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [metadata, setMetadata] = useState<Metadata|null>(null)
  const onChangeNRIC = (e: ChangeEvent<HTMLInputElement>) => setNRIC(e.target.value)
  const fetchMetadata = async () => {
    const tokenURI = await readContract({
      address: BenzNFTAddress,
      abi: benzNFTabi,
      functionName: "getReceipt",
    })
    if (!tokenURI) return

    const res = await fetch(addIPFSProxy(tokenURI as string))
    const metadata = await res.json()
    setMetadata(metadata)
  }

  useEffect(() => {
    if (isConnected) {
      setIsDefinitelyConnected(true)
      fetchMetadata()
    } else {
      setIsDefinitelyConnected(false)
    }
  }, [isConnected])

  const mint = async () => {
    if (nric === "") {
      setErrMsg("NRIC can not be empty.")
      return
    }
    setErrMsg('')
    try {
    const { request } = await prepareWriteContract({
      address: BenzNFTAddress,
      abi: benzNFTabi,
      functionName: "mintNFT",
    })

    const { hash } = await writeContract(request)
    setProcessing(true)
    const data = await waitForTransaction({
      confirmations: 1,
      hash,
    })
    if (data) {
      postProfile(nric, address as `0x${string}`)
      fetchMetadata()
      setProcessing(false)
    }
    } catch (err) {
      setProcessing(false)
      const error = err as ContractFunctionExecutionError
      if (error.details) {
        const match = error.details.match(regexpRevertedReason)
        if (match) {
          setErrMsg(match[1])
        } else {
          setErrMsg(error.details)
        }
      }
    }
  }

  return (
    <Box margin={8}>
      <Heading marginY={4}>NFT portal</Heading>
      <Heading marginY={4} size="md">1. Connect your wallet</Heading>
      <Web3Button />
      {
        isDefinitelyConnected && metadata === null && (<>
        <Heading marginY={4} size="md">2. Input your NRIC/FIN</Heading>
        <Input marginY={2} width={250} onChange={onChangeNRIC} />
        <Box marginY={4} color="red">{errMsg}</Box>
        <Box marginY={2}>
          <Button onClick={mint} disabled={processing}>Mint</Button>
        </Box>
      </>)
      }
      {
        metadata && (
          <Box marginY={4}>
            <Heading marginY={2} size="md">Your NFT</Heading>
            <Heading marginY={2} size="xs">Name: {metadata.name}</Heading>
            <Heading marginY={2} size="xs">Description {metadata.description}</Heading>
            <img src={addIPFSProxy(metadata.image)} />
          </Box>
        )
      }
    </Box>
  )
}