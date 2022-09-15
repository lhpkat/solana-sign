import { useEffect, useState } from 'react'
import { TokenListProvider } from '@solana/spl-token-registry'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'


const clusterSlug = 'devnet' // devnet, mainnet-beta
const PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

const useUserInfo = () => {
  const [tokens, setTokens] = useState({})
  const [userInfo, setUserInfo] = useState({})
  const [myTokens, setMyTokens] = useState([])

  useEffect(() => {
    setTimeout(() => {
      const isTokenLoaded = Object.keys(tokens).length > 0

      if (!isTokenLoaded) {
        return false
      }

      const isPhantomInstalled = window.solana && window.solana.isPhantom
      if (!isPhantomInstalled) {
        return window.open('https://phantom.app/', '_blank')
      }

      window.solana.connect({ onlyIfTrusted: true }).then(async ({ publicKey }) => {
        console.log('publicKey', publicKey);
        init({ publicKey })
      })
    }, 100)
  }, [tokens])

  const init = async ({ publicKey }) => {
    const connection = new Connection(clusterApiUrl(clusterSlug), 'confirmed')
    const address = publicKey.toString()
    const pubKey = new PublicKey(address)
    const programId = new PublicKey(PROGRAM_ID)
    const getTokenAccountsByOwner = await connection.getParsedTokenAccountsByOwner(pubKey, { programId })
    const myBalance = await connection.getBalance(pubKey)
    const myBalanceString = `${new Intl.NumberFormat().format(myBalance / LAMPORTS_PER_SOL)} SOL`
    const splTokens = []

    const info = await connection.getBalance(pubKey);

    console.log('info', info);

    console.log('getTokenAccountsByOwner', getTokenAccountsByOwner);

    for (const token of getTokenAccountsByOwner.value) {
      const { mint: tokenAddress, tokenAmount } = token.account.data.parsed.info
      splTokens.push({ tokenAddress, balance: tokenAmount.uiAmountString })
    }

    setMyTokens(splTokens)
    setUserInfo({ publicKey: pubKey.toString(), balance: myBalanceString })
  }

  useEffect(() => {
    new TokenListProvider().resolve().then(tokens => {
      console.log('tokens', tokens);
      const allToken = {}
      const tokenList = tokens.filterByClusterSlug(clusterSlug).getList()

      for (const token of tokenList) {
        allToken[token.address] = token
      }

      setTokens(allToken)
    })

    handleConnect();
  }, [])

  const handleConnect = async () => {
    const resp = await window.solana.connect()
    const publicKey = resp.publicKey.toString()

    init({ publicKey })
  }

  const handleLogout = () => {
    window.solana.disconnect()
    setUserInfo({})
    setMyTokens([])
  }

  return ({
      tokens,
      userInfo,
      myTokens,
      handleLogout
  })
}

export default useUserInfo;
