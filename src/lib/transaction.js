import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletContextState } from '@solana/wallet-adapter-react';


const wallets = {
    Phantom: {
        website: 'https://phantom.app',
        chromeUrl: 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
        getAdapter() {
            return new PhantomWalletAdapter()
        },
    },
}

const createWeb3Connection = (endpoint) => {
    // devnet:
    // testnet:
    // mainnet-beta
    const web3 = new Connection(clusterApiUrl('devnet'), "recent")
    return web3
}

const transferNativeSol = async ({
  toPubkey,
  amount,
  payerPublicKey,
  connection,
  wallet,
}) => {
    if (!payerPublicKey) {
        return console.error('error not connect wallet');
    }

    const instructions = [];

    instructions.push(
        SystemProgram.transfer({
            fromPubkey: payerPublicKey,
            lamports: amount,
            toPubkey,
        }),
    );
    const transaction = new Transaction();

    instructions.forEach(instruction => {
        transaction.add(instruction);
    });
    transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
        // await createWeb3Connection().getRecentBlockhash('max')
    ).blockhash;
    transaction.feePayer = payerPublicKey;

    const signedTransaction = await wallet.signTransaction(transaction);
    const tx = await connection.sendRawTransaction(
    // const tx = await createWeb3Connection().sendRawTransaction(
        signedTransaction.serialize(),
    );
    return tx;
};

export {
    wallets,
    transferNativeSol,
    createWeb3Connection
}
